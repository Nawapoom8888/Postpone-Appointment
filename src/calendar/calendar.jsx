// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Calendar, dateFnsLocalizer } from "react-big-calendar";
// import { RRule } from "rrule";
// import {
//     format, parse, startOfWeek, getDay,
//     addDays, addMinutes
// } from "date-fns";
// import enUS from "date-fns/locale/en-US";
// import { th } from 'date-fns/locale';
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { Select, Input, Switch, Button, Modal } from "antd";

// /* =========================
// * Localizer
// * ========================= */
// const locales = { "th-TH": th };
// const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// /* =========================
// * OR Defaults
// * ========================= */
// const OR_DEFAULT_SETUP_MIN = 0;
// const OR_DEFAULT_CLEANUP_MIN = 0;

// /* =========================
// * Helpers
// * ========================= */
// const pad2 = (n) => String(n).padStart(2, "0");

// function parseDateYMD(str) {
//     if (!str) return null;
//     const [y, m, d] = String(str).split("-").map(n => parseInt(n, 10));
//     return new Date(y, (m || 1) - 1, d || 1);
// }
// function parseAPIOffsetDate(str) {
//     if (!str) return null;
//     const isoWithOffset = String(str).split(" Asia/")[0];
//     const dt = new Date(isoWithOffset);
//     return isNaN(dt) ? null : dt;
// }
// function toLocalIsoNoMillis(date) {
//     const y = date.getFullYear();
//     const M = pad2(date.getMonth() + 1);
//     const d = pad2(date.getDate());
//     const h = pad2(date.getHours());
//     const m = pad2(date.getMinutes());
//     return `${y}-${M}-${d}T${h}:${m}:00Z`;
// }
// function minutesBetween(a, b) {
//     return Math.max(1, Math.round((b.getTime() - a.getTime()) / 60000));
// }
// function overlaps(aStart, aEnd, bStart, bEnd) { return aStart < bEnd && bStart < aEnd; }
// function addMin(dt, min) { return new Date(dt.getTime() + min * 60000); }

// function generateSlotsForDay(date, startH, startM, endH, endM, slotMinutes, title, resource) {
//     const slots = [];
//     let start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startH, startM);
//     const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endH, endM);
//     while (start < end) {
//         const slotEnd = addMinutes(start, slotMinutes);
//         slots.push({
//             id: `${resource.doctor_code || resource.facility || "res"}_${date.toDateString()}_${pad2(start.getHours())}:${pad2(start.getMinutes())}`,
//             title,
//             start: new Date(start),
//             end: slotEnd,
//             resource,
//         });
//         start = slotEnd;
//     }
//     return slots;
// }
// const DOW_MAP = {
//     Sun: { rrule: RRule.SU, idx: 0 },
//     Mon: { rrule: RRule.MO, idx: 1 },
//     Tue: { rrule: RRule.TU, idx: 2 },
//     Wed: { rrule: RRule.WE, idx: 3 },
//     Thu: { rrule: RRule.TH, idx: 4 },
//     Fri: { rrule: RRule.FR, idx: 5 },
//     Sat: { rrule: RRule.SA, idx: 6 },
// };
// function firstOccurrenceOnOrAfter(effFromDate, dowIdx) {
//     const d = new Date(effFromDate);
//     const delta = (dowIdx - d.getDay() + 7) % 7;
//     d.setDate(d.getDate() + delta);
//     return d;
// }
// function bookingKey(doctorCode, startDate) {
//     const y = startDate.getFullYear();
//     const M = pad2(startDate.getMonth() + 1);
//     const d = pad2(startDate.getDate());
//     const h = pad2(startDate.getHours());
//     const m = pad2(startDate.getMinutes());
//     return `${doctorCode}__${y}-${M}-${d}T${h}:${m}:00`;
// }

// /** รวม “ว่าง N คิว” เฉพาะ X-ray โดยแยกตาม เวลา+Facility */
// function aggregateFreeSlotsByTimeAndFacility(events) {
//     const groups = new Map();
//     const keep = [];
//     for (const ev of events) {
//         if (ev.booked) { keep.push(ev); continue; }
//         const startKey = toLocalIsoNoMillis(ev.start);
//         const facility = ev?.resource?.facility || "";
//         const k = `${startKey}__${facility}`;
//         if (!groups.has(k)) {
//             groups.set(k, { start: ev.start, end: ev.end, list: [ev], facility });
//         } else {
//             const g = groups.get(k);
//             g.list.push(ev);
//             if (ev.end > g.end) g.end = ev.end;
//         }
//     }
//     for (const [, g] of groups) {
//         if (g.list.length === 1) {
//             const ev = g.list[0];
//             keep.push({ ...ev, title: `ว่าง 1 คิว` });
//         } else {
//             const sample = g.list[0];
//             keep.push({
//                 id: `agg_${toLocalIsoNoMillis(g.start)}_${g.facility}`,
//                 title: `ว่าง ${g.list.length} คิว`,
//                 start: g.start,
//                 end: g.end,
//                 resource: { ...sample.resource, facility: g.facility },
//                 aggregated: true,
//                 free_count: g.list.length,
//             });
//         }
//     }
//     return keep;
// }

// // แปลงเวลาจากสตริง API ที่มี +07:00 Asia/Bangkok → เป็น Date
// function parseAPITimeMaybe(s) {
//     if (!s) return null;
//     // ใช้ logic เดียวกับ parseAPIOffsetDate ที่คุณมีอยู่แล้ว
//     return parseAPIOffsetDate(s);
// }

// // ฟอร์แมตช่วงเวลา HH:mm - HH:mm
// function fmtTimeRange(start, end) {
//     if (!(start instanceof Date) || isNaN(start)) return "";
//     if (!(end instanceof Date) || isNaN(end)) return format(start, "HH:mm");
//     return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
// }

// // สกัดชื่อคนไข้: ใช้ Patient_Name ถ้ามี; ถ้าไม่มีก็ลอง Prefix+First+Last
// function getPatientNameFromBooking(b) {
//     if (!b) return "";
//     if (b.Patient_Name) return String(b.Patient_Name);
//     const p = [b.Prefix_Name, b.First_Name, b.Last_Name].filter(Boolean).join(" ").trim();
//     return p || "";
// }

// // สกัด Concat Facility + เวลา จาก booking
// // รองรับได้ทั้งแบบ table: "Table::Facility" และแบบ field เดี่ยว Start_Time_Facility_1/End_Time_Facility_1
// function getFacilityLineFromBooking(b) {
//     if (!b) return "";
//     const rows = Array.isArray(b["Table::Facility"]) ? b["Table::Facility"] : null;
//     if (rows && rows.length) {
//         // รวมหลาย facility ด้วย " | "
//         return rows.map((r) => {
//             const name = r.Facility_Name || r.Facilities_Name || "";
//             const st = parseAPITimeMaybe(r.Start_Time_Facility || r.Start_Time);
//             const et = parseAPITimeMaybe(r.End_Time_Facility || r.End_Time);
//             const time = fmtTimeRange(st, et);
//             if (!name && !time) return "";
//             return `${name}${time ? ` : ${time}` : ""}`;
//         }).filter(Boolean).join(" | ");
//     }
//     // ฟอร์แมตเดี่ยว (กรณีไม่มีตาราง)
//     const name = b.Concat_Facility_Name || b.Facility_Name || b.Facilities_Name || "";
//     const st = parseAPITimeMaybe(b.Start_Time_Facility || b.Start_Time_Facility_1);
//     const et = parseAPITimeMaybe(b.End_Time_Facility || b.End_Time_Facility_1);
//     const time = fmtTimeRange(st, et);
//     if (!name && !time) return "";
//     return `${name}${time ? ` : ${time}` : ""}`;
// }

// // ✅ สร้างข้อความ title ใหม่สำหรับ "slot ที่ถูกจอง"
// function buildBookedEventTitle(ev, bookingDetail) {
//     // const slotTime = fmtTimeRange(ev.start, ev.end);          // บรรทัด 1: เวลา Slot
//     const patient = getPatientNameFromBooking(bookingDetail); // บรรทัด 2: Patient_Name (เว้นว่างได้)
//     const doctor = bookingDetail?.Doctor_Name || ev?.resource?.doctor || ""; // บรรทัด 3: Doctor_Name
//     const facLine = getFacilityLineFromBooking(bookingDetail);              // บรรทัด 4: Concat_Facility_Name : hh:mm - hh:mm

//     // รวมเป็นหลายบรรทัด (ถ้าบางบรรทัดว่างจะข้าม)
//     return [patient, doctor, facLine].filter(Boolean).join("\n");
// }

// /* สีสำหรับ Facility */
// function hashStr(s = "") { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
// function facilityColor(name = "") { if (!name) return "#06b6d4"; const h = hashStr(name) % 360; return `hsl(${h} 70% 48%)`; }
// function facilityTextColor() { return "#fff"; }

// /* ===== KF view config for All ===== */
// const ACCOUNT_ID = "Ac7wE0VDRiSM";
// const APP_ID = "Hospital_Information_Systems_HIS_A00";

// /* ===== KF view config for doctors data ===== */
// const DATAFORM_ID = "Weekly_Slot_Dataform_A00";
// const VIEW_ID = "Add_Data_A05";
// const PAGE_SIZE = 500;

// /* Helpers */
// const uniq = (arr) => Array.from(new Set(arr));

// function splitClinics(str) {
//     return String(str || "")
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean);
// }




// /* ===== KF detail-view config (per doctor) ===== */
// const FORM_SLUG = "Weekly_Slot_Dataform_A00";
// const DETAIL_VIEW_SLUG = "View_Table_A00"; // the view you shared

// /* ===== Appointments view (bookings) ===== */
// const APPT_FORM_SLUG = "Appointment_Transaction_A00";
// const APPT_VIEW_SLUG = "Add_Data_A50";
// const APPT_PAGE_SIZE = 500;

// /* ===== Facilities view (options for the Facilities select) ===== */
// const FAC_FORM_SLUG = "Facilities_Slot_Master_A00";
// const FAC_VIEW_SLUG = "Add_Data_A51";
// const FAC_PAGE_SIZE = 500;

// // Convert facility rows -> [{ value: string, label: string }]
// function toStr(x) { return x == null ? "" : String(x).trim(); }

// function normalizeFacilityRow(row) {
//     // try common field names from your views/forms
//     const text = toStr(
//         row.Facilities_Name ??
//         row.Facility_Name ??
//         row.Facility ??
//         row.Name ??
//         row.label ??
//         row.value ??
//         ""
//     );
//     return text ? { value: text, label: text } : null;
// }

// function uniqueOptions(options) {
//     const map = new Map();
//     for (const o of options) {
//         if (!o || !o.value) continue;
//         if (!map.has(o.value)) map.set(o.value, o);
//     }
//     return Array.from(map.values());
// }

// /** Main converter */
// export function facilitiesToOptions(rows) {
//     if (!Array.isArray(rows)) return [];
//     return uniqueOptions(rows.map(normalizeFacilityRow).filter(Boolean));
// }

// /* =========================
// * Component
// * ========================= */
// export default function UnifiedCalendar_OR_WithLegacyFacility() {
//     // Doctors/Clinics
//     const [doctors, setDoctors] = useState([]);
//     const [clinicOptions, setClinicOptions] = useState([]);
//     const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);
//     const [selectedClinic, setSelectedClinic] = useState(null);
//     const [docDetailsMap, setDocDetailsMap] = useState({});

//     // Facilities rows (legacy UX)
//     const [facilities, setFacilities] = useState([]);
//     const [facilityRows, setFacilityRows] = useState([]);

//     // ไว้จำ OR preview ตอนลาก เพื่อเอามา log อีกครั้งตอน Confirm
//     const orPreviewRef = useRef(null);

//     // Events
//     const [eventsDoctor, setEventsDoctor] = useState([]); // non X-ray
//     const [eventsXray, setEventsXray] = useState([]);     // aggregated
//     const [eventsOR, setEventsOR] = useState([]);         // OR events (tentative/confirmed)

//     // Selection / focus
//     const [selectedDoctorEvent, setSelectedDoctorEvent] = useState(null);
//     const [selectedXrayEventId, setSelectedXrayEventId] = useState(null);
//     const [selectedOrEventId, setSelectedOrEventId] = useState(null);

//     // Committed highlights
//     const [committedDoctorId, setCommittedDoctorId] = useState(null);
//     const [committedXrayIds, setCommittedXrayIds] = useState(new Set());

//     // Confirmed (grey)
//     const [confirmedDoctorIds, setConfirmedDoctorIds] = useState(new Set());
//     const [confirmedXrayIds, setConfirmedXrayIds] = useState(new Set());

//     // OR draw mode (ลากเพื่อสร้าง OR tentative)
//     const [orDrawMode, setOrDrawMode] = useState(false);

//     // Input refs for auto-focus after adding a row
//     const inputRefs = useRef(new Map());
//     const [lastAddedRowId, setLastAddedRowId] = useState(null);
//     const [focusedCell, setFocusedCell] = useState(null); // { rowId, field: "Start_Time" | "End_Time" }


//     // Appointment/Booking Transaction
//     const [bookings, setBookings] = useState([]); // LIVE bookings from KF


//     /* ===== Appointments view (bookings) ===== */
//     const APPT_FORM_SLUG = "Appointment_Transaction_A00";
//     const APPT_VIEW_SLUG = "Add_Data_A50";
//     const APPT_PAGE_SIZE = 500;

//     const setInputRef = (key, el) => {
//         if (!el) inputRefs.current.delete(key);
//         else inputRefs.current.set(key, el);
//     };
//     useEffect(() => {
//         if (!lastAddedRowId) return;
//         const key = `Start_Time:${lastAddedRowId}`;
//         const el = inputRefs.current.get(key);
//         if (el) {
//             el.focus();
//             el.select?.();
//             el.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
//         }
//         setLastAddedRowId(null);
//     }, [lastAddedRowId]);

//     useEffect(() => {
//         (async () => {
//             try {
//                 const opts = await fetchFacilitiesOptions();
//                 setFacilities(opts);
//             } catch (e) {
//                 console.error("Load facilities failed:", e);
//                 setFacilities([]); // fallback: no options
//             }
//         })();
//     }, []);

//     /* ---- Filter doctors (non X-ray only) ---- */
//     const filteredDoctorsNonXray = useMemo(() => {
//         const nonXray = doctors.filter(d => (d.doctorType || "").toLowerCase() !== "x-ray");
//         if (!selectedClinic) return nonXray;
//         return nonXray.filter(d => {
//             const clinics = String(d.concatClinic || "").split(",").map(s => s.trim()).filter(Boolean);
//             return clinics.includes(selectedClinic);
//         });
//     }, [doctors, selectedClinic]);

//     /* ---- Load doctors from Kissflow VIEW (replaces previous loader) ---- */
//     useEffect(() => {
//         (async () => {
//             try {
//                 if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
//                 const kf = window.kf;

//                 let page = 1;
//                 const rows = [];

//                 while (true) {
//                     const url =
//                         `/form/2/${ACCOUNT_ID}/${DATAFORM_ID}/view/${VIEW_ID}/list` +
//                         `?apply_preference=true&page_number=${page}&page_size=${PAGE_SIZE}` +
//                         `&_application_id=${encodeURIComponent(APP_ID)}`;

//                     const res = await kf.api(url, { method: "GET" });
//                     const batch = Array.isArray(res?.Data) ? res.Data : [];

//                     rows.push(...batch);

//                     // stop when fewer than PAGE_SIZE returned (no more pages)
//                     if (batch.length < PAGE_SIZE) break;
//                     page += 1;
//                 }

//                 // Aggregate rows by Form_ID (one doc can appear multiple times)
//                 const byId = new Map();
//                 for (const r of rows) {
//                     const id = r.Form_ID || r._id || r.id;
//                     if (!id) continue;

//                     if (!byId.has(id)) {
//                         byId.set(id, {
//                             _id: id,
//                             name: r.Doctor_Name || "",
//                             code: String(r.Doctor_Code || ""),
//                             clinics: new Set(),           // temp set, will stringify later
//                             doctorType: (r.Doctor_Type || "general").toLowerCase(), // default if not present
//                         });
//                     }

//                     const entry = byId.get(id);
//                     // prefer non-empty name/code if some rows have it
//                     if (!entry.name && r.Doctor_Name) entry.name = r.Doctor_Name;
//                     if (!entry.code && r.Doctor_Code) entry.code = String(r.Doctor_Code);

//                     // Collect clinics from both fields
//                     splitClinics(r.Concat_Clinic).forEach((c) => entry.clinics.add(c));
//                     if (r.Clinic) entry.clinics.add(String(r.Clinic));
//                     // If your view exposes Doctor_Type, keep the first non-empty one
//                     if (r.Doctor_Type && !entry._typeLocked) {
//                         entry.doctorType = String(r.Doctor_Type).toLowerCase();
//                         entry._typeLocked = true;
//                     }
//                 }

//                 // Final list in YOUR required format
//                 const list = Array.from(byId.values()).map((x) => ({
//                     _id: x._id,
//                     name: x.name,
//                     code: x.code,
//                     concatClinic: Array.from(x.clinics).join(","), // "A,B,C"
//                     doctorType: x.doctorType || "general",
//                 }));

//                 console.info("list ->", list)

//                 setDoctors(list);

//                 // Build clinic filter options from the merged concatClinic
//                 const clinicSet = new Set();
//                 list.forEach((d) => splitClinics(d.concatClinic).forEach((c) => clinicSet.add(c)));
//                 setClinicOptions(Array.from(clinicSet).map((c) => ({ value: c, label: c })));
//             } catch (e) {
//                 console.error("Load doctors from KF view failed:", e);
//                 setDoctors([]);
//                 setClinicOptions([]);
//             }
//         })();
//     }, []);

//     async function fetchDocDetailsMapByIds(ids, { concurrency = 5 } = {}) {
//         if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
//         const kf = window.kf;

//         const results = {};
//         let i = 0;

//         async function fetchOne(id) {
//             const url =
//                 `/form/2/${ACCOUNT_ID}/${FORM_SLUG}/view/${DETAIL_VIEW_SLUG}/${encodeURIComponent(id)}` +
//                 `?_application_id=${encodeURIComponent(APP_ID)}`;
//             const res = await kf.api(url, { method: "GET" });
//             // const data = Array.isArray(res?.Data) ? res.Data : [];
//             console.log("Data ->", res)
//             console.log("Data Table ->", res["Table::Weekly_Slot"])
//             // results[id] = buildDocDetailFromViewData(id, res);
//             results[id] = res;
//         }

//         // simple concurrency controller
//         const pool = new Array(Math.min(concurrency, ids.length)).fill(0).map(async () => {
//             while (i < ids.length) {
//                 const idx = i++;
//                 const id = ids[idx];
//                 try {
//                     await fetchOne(id);
//                 } catch (e) {
//                     console.error("Fetch doc detail failed for", id, e);
//                     // still put a minimal stub so downstream code won't break
//                     results[id] = {
//                         Doctor_Name: "",
//                         Doctor_Code: id,
//                         Doctor_Type: "general",
//                         "Table::Weekly_Slot": [],
//                         "Table::Off_Day_Schedule_1": [],
//                     };
//                 }
//             }
//         });
//         console.info("result -> ", results)

//         await Promise.all(pool);
//         return results; // { [id]: {Doctor_Name, Doctor_Code, Doctor_Type, "Table::Weekly_Slot":[], "Table::Off_Day_Schedule_1":[] } }
//     }

//     useEffect(() => {
//         (async () => {
//             if (!doctors.length) return;
//             const ids = doctors.map(d => d._id).filter(Boolean);
//             try {
//                 const map = await fetchDocDetailsMapByIds(ids, { concurrency: 6 });
//                 setDocDetailsMap(map);
//                 // console.log("DETAILS MAP", map);
//             } catch (e) {
//                 console.error("Load doc detail map failed:", e);
//                 setDocDetailsMap({});
//             }
//         })();
//     }, [doctors]);

//     async function fetchAppointmentsList({ pageSize = APPT_PAGE_SIZE } = {}) {
//         if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
//         const kf = window.kf;

//         const all = [];
//         let page = 1;

//         while (true) {
//             const url =
//                 `/form/2/${ACCOUNT_ID}/${APPT_FORM_SLUG}/view/${APPT_VIEW_SLUG}/list` +
//                 `?apply_preference=true&page_number=${page}&page_size=${pageSize}` +
//                 `&_application_id=${encodeURIComponent(APP_ID)}`;

//             const res = await kf.api(url, { method: "GET" });
//             const batch = Array.isArray(res?.Data) ? res.Data : [];
//             all.push(...batch);

//             if (batch.length < pageSize) break; // no more pages
//             page += 1;
//         }

//         return all;
//     }

//     /* ---- Load bookings from Kissflow ---- */
//     useEffect(() => {
//         (async () => {
//             try {
//                 const list = await fetchAppointmentsList();
//                 setBookings(list);
//             } catch (e) {
//                 console.error("Load bookings failed:", e);
//                 setBookings([]); // fallback to none
//             }
//         })();
//     }, []);

//     async function fetchFacilitiesOptions({ pageSize = FAC_PAGE_SIZE } = {}) {
//         if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
//         const kf = window.kf;

//         const all = [];
//         let page = 1;

//         while (true) {
//             const url =
//                 `/form/2/${ACCOUNT_ID}/${FAC_FORM_SLUG}/view/${FAC_VIEW_SLUG}/list` +
//                 `?apply_preference=true&page_number=${page}&page_size=${pageSize}` +
//                 `&_application_id=${encodeURIComponent(APP_ID)}`;

//             const res = await kf.api(url, { method: "GET" });
//             const batch = Array.isArray(res?.Data) ? res.Data : [];
//             all.push(...batch);

//             if (batch.length < pageSize) break; // no more pages
//             page += 1;
//         }

//         const options = facilitiesToOptions(all);

//         return options; // [{ value: "X-ray", label: "X-ray" }, ...]
//     }
//     async function fetchFacilityIndex({ pageSize = 500 } = {}) {
//         if (!window.kf) throw new Error("window.kf not found");
//         const kf = window.kf;
//         const all = [];
//         let page = 1;
//         while (true) {
//             const url =
//                 `/form/2/${ACCOUNT_ID}/Facilities_Slot_Master_A00/view/Facilities_Slot_Master_Table_A00/list` +
//                 `?apply_preference=true&page_number=${page}&page_size=${pageSize}` +
//                 `&_application_id=${encodeURIComponent(APP_ID)}`;
//             const res = await kf.api(url, { method: "GET" });
//             const batch = Array.isArray(res?.Data) ? res.Data : [];
//             all.push(...batch);
//             if (batch.length < pageSize) break;
//             page++;
//         }
//         return all; // array rows (Facilities_Name, Require_Doctor, Item_ID, etc.)
//     }

//     async function fetchFacilityDetail(formId) {
//         if (!window.kf) throw new Error("window.kf not found");
//         const kf = window.kf;
//         const url =
//             `/form/2/${ACCOUNT_ID}/Facilities_Slot_Master_A00/view/Facilities_Slot_Master_Table_A00/${encodeURIComponent(formId)}` +
//             `?_application_id=${encodeURIComponent(APP_ID)}`;
//         const res = await kf.api(url, { method: "GET" });
//         return res; // contains Table::Weekly_Slot and Table::Day_Off_Schedule
//     }

//     // Helper of Facility
//     // === Time math: gcd/lcm ===
//     function gcd(a, b) { while (b) { const t = b; b = a % b; a = t; } return a; }
//     function lcm(a, b) { if (!a || !b) return a || b || 15; return (a * b) / gcd(a, b); }

//     // Split range [start,end) -> buckets every `minutes`
//     function splitIntoBuckets(start, end, minutes) {
//         const out = [];
//         let t = new Date(start);
//         while (t < end) {
//             const nxt = addMin(t, minutes);
//             if (nxt > end) break;
//             out.push({ start: new Date(t), end: new Date(nxt) });
//             t = nxt;
//         }
//         return out;
//     }

//     // Remove parts of [s,e) that overlap with any "off ranges"
//     function subtractOffRanges(s, e, offRanges) {
//         // simple: if any overlap => not available. (ถ้าต้องการละเอียด แยกทอนช่วงได้)
//         for (const r of (offRanges || [])) {
//             if (overlaps(s, e, r.start, r.end)) return null; // ตัดทิ้งทั้ง bucket
//         }
//         return { start: s, end: e };
//     }

//     // Count “duty units” in [s,e) for timelines (each item has Slot_Minute & weekly open ranges)
//     function countDutyInBucket(bucketStart, bucketEnd, openRanges) {
//         // ถ้า openRanges มีรายการใดครอบคลุม bucket เต็มช่วง => ถือว่ามี 1 หน่วยใน bucket นั้น
//         // (สำหรับแพทย์: คือมีหมอคนหนึ่งที่เวรครอบคลุม bucket; สำหรับเครื่อง: คือ Capacity ต่อ slot)
//         let count = 0;
//         for (const r of openRanges) {
//             if (r.start <= bucketStart && r.end >= bucketEnd) {
//                 count += (r.capacityPerSlot || 1); // สำหรับเครื่องสามารถมี capacity ต่อ slot
//             }
//         }
//         return count;
//     }

//     function buildFacilityOpenRanges(detail, viewStart, viewEnd) {
//         const weekly = Array.isArray(detail?.["Table::Weekly_Slot"]) ? detail["Table::Weekly_Slot"] : [];
//         const offRaw = Array.isArray(detail?.["Table::Day_Off_Schedule"]) ? detail["Table::Day_Off_Schedule"] : [];

//         const offRanges = offRaw
//             .map(od => ({ start: parseAPIOffsetDate(od.Start_Date), end: parseAPIOffsetDate(od.End_Date) }))
//             .filter(r => r.start && r.end && r.start < r.end);

//         const out = [];

//         weekly.forEach(slot => {
//             const dow = slot?.Day_of_Week;
//             if (!dow || !DOW_MAP[dow]) return;
//             const [sH, sM] = String(slot.Start_Time || "08:00").split(":").map(n => parseInt(n, 10) || 0);
//             const [eH, eM] = String(slot.End_Time || "17:00").split(":").map(n => parseInt(n, 10) || 0);
//             const effFrom = slot?.Effective_Date_From ? parseDateYMD(slot.Effective_Date_From) : viewStart;
//             const effTo = slot?.Effective_Date_To ? parseDateYMD(slot.Effective_Date_To) : viewEnd;

//             const dt0 = firstOccurrenceOnOrAfter(effFrom, DOW_MAP[dow].idx);
//             const rule = new RRule({ freq: RRule.WEEKLY, interval: 1, byweekday: [DOW_MAP[dow].rrule], dtstart: dt0, until: effTo });
//             const dates = rule.between(viewStart, viewEnd, true);

//             dates.forEach(d => {
//                 const s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), sH, sM);
//                 const e = new Date(d.getFullYear(), d.getMonth(), d.getDate(), eH, eM);
//                 const kept = subtractOffRanges(s, e, offRanges);
//                 if (!kept) return;
//                 out.push({
//                     start: kept.start,
//                     end: kept.end,
//                     slotMinute: Number(slot.Slot_Minute || 30),
//                     capacityPerSlot: Number(slot.Capacity_Per_Slot || 1),
//                 });
//             });
//         });

//         return out; // [{start,end,slotMinute,capacityPerSlot},...]
//     }

//     function buildXrayDoctorOpenRanges(docDetailsMap, viewStart, viewEnd) {
//         const out = []; // เก็บเป็นรายการ (ของหมอแต่ละคน)
//         for (const id of Object.keys(docDetailsMap || {})) {
//             const d = docDetailsMap[id];
//             const doctorTypeDefault = (d?.Doctor_Type || "").toLowerCase();
//             const weekly = Array.isArray(d?.["Table::Weekly_Slot"]) ? d["Table::Weekly_Slot"] : [];
//             const offRaw = Array.isArray(d?.["Table::Off_Day_Schedule_1"]) ? d["Table::Off_Day_Schedule_1"] : [];
//             const offRanges = offRaw
//                 .map(od => ({ start: parseAPIOffsetDate(od.Start_Date), end: parseAPIOffsetDate(od.End_Date) }))
//                 .filter(r => r.start && r.end && r.start < r.end);

//             weekly.forEach(slot => {
//                 const type = String(slot?.Doctor_Type || doctorTypeDefault).toLowerCase();
//                 if (type !== "x-ray") return; // นับเฉพาะเวร X-ray

//                 const dow = slot?.Day_of_Week;
//                 if (!dow || !DOW_MAP[dow]) return;
//                 const [sH, sM] = String(slot.Start_Time || "08:00").split(":").map(n => parseInt(n, 10) || 0);
//                 const [eH, eM] = String(slot.End_Time || "17:00").split(":").map(n => parseInt(n, 10) || 0);

//                 const effFrom = slot?.Effective_From ? parseDateYMD(slot.Effective_From) : viewStart;
//                 const effTo = slot?.Effective_Till ? parseDateYMD(slot.Effective_Till) : viewEnd;

//                 const dt0 = firstOccurrenceOnOrAfter(effFrom, DOW_MAP[dow].idx);
//                 const rule = new RRule({ freq: RRule.WEEKLY, interval: 1, byweekday: [DOW_MAP[dow].rrule], dtstart: dt0, until: effTo });
//                 const dates = rule.between(viewStart, viewEnd, true);

//                 dates.forEach(d0 => {
//                     const s = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), sH, sM);
//                     const e = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), eH, eM);
//                     const kept = subtractOffRanges(s, e, offRanges);
//                     if (!kept) return;
//                     out.push({
//                         start: kept.start,
//                         end: kept.end,
//                         slotMinute: Number(slot.Slot_Duration || 15), // ค่า slot ของหมอ
//                         capacityPerSlot: 1, // หมอ 1 คน = 1 หน่วย
//                         doctor_code: d?.Doctor_Code || id,
//                         doctor_name: d?.Doctor_Name || "",
//                     });
//                 });
//             });
//         }
//         return out; // รายการของช่วงเวร x-ray ทุกคน
//     }

//     function buildFacilityFreeEvents({ facilityDetail, doctorOpenRanges, viewStart, viewEnd }) {
//         const facName = facilityDetail?.Facilities_Name || "";
//         const facRequireDoctor = !!facilityDetail?.Require_Doctor;

//         // 1) facility ranges
//         const facRanges = buildFacilityOpenRanges(facilityDetail, viewStart, viewEnd);
//         if (!facRanges.length) return [];

//         // 2) กลุ่มตามวัน (เพื่อลดงาน) แล้วแตกเป็น bucket ที่เป็น base = lcm(slot_fac, slot_doc)
//         //    base ต้องรองรับทั้งหมอและเครื่อง
//         //    หมายเหตุ: ถ้า doctorOpenRanges ว่าง และ facility ไม่ require doctor → base = slot_fac
//         const sampleFacSlot = facRanges.find(Boolean)?.slotMinute || 30;
//         const sampleDocSlot = doctorOpenRanges.find(Boolean)?.slotMinute || sampleFacSlot;
//         const base = lcm(sampleFacSlot, sampleDocSlot);

//         const out = [];

//         facRanges.forEach(fr => {
//             // หาบัคเก็ต facility ตาม base ในช่วง fr
//             const buckets = splitIntoBuckets(fr.start, fr.end, base);

//             buckets.forEach(({ start, end }) => {
//                 // 2.1 นับเครื่องได้กี่หน่วยใน bucket นี้ (ต้องครอบคลุมเต็ม bucket)
//                 // ถ้า facility slotMinute != base ก็ยังถือว่า valid เพราะ split ตาม base แล้ว
//                 const facUnits = countDutyInBucket(start, end, facRanges);

//                 if (facUnits <= 0) return;

//                 // 2.2 นับหมอ x-ray duty หน่วยที่ครอบคลุม bucket นี้
//                 let docUnits = 0;
//                 if (facRequireDoctor) {
//                     docUnits = countDutyInBucket(start, end, doctorOpenRanges);
//                     if (docUnits <= 0) return; // ไม่มีหมอ duty ตรง bucket นี้
//                 } else {
//                     // ไม่ require doctor → ถือว่าใช้เฉพาะเครื่อง
//                     docUnits = Infinity;
//                 }

//                 // 2.3 ความจุว่าง = min(เครื่อง, หมอ)
//                 const freeCount = Math.min(facUnits, docUnits);

//                 if (freeCount > 0) {
//                     out.push({
//                         id: `FAC_${facName}_${toLocalIsoNoMillis(start)}`,
//                         title: `ว่าง ${freeCount} คิว`,
//                         start, end,
//                         resource: { facility: facName, free_count: freeCount },
//                         aggregated: true, // ให้ renderer ของคุณทำสี facility
//                     });
//                 }
//             });
//         });

//         return out;
//     }





//     /* ---- Build schedules & bookings (MOCK) ---- */
//     useEffect(() => {
//         (async () => {
//             const viewStart = new Date(2025, 8, 1);
//             const viewEnd = addDays(viewStart, 90);

//             // 1) doctor (non x-ray) & booked-title (ส่วนเดิมของคุณ) -> setEventsDoctor(...)
//             const bookingIndex = new Map();
//             for (const b of bookings) {
//                 const doctorCode = String(b.Doctor_Code || "").trim();
//                 const start = parseAPIOffsetDate(b.Appointment_Date_Start);
//                 const end = parseAPIOffsetDate(b.Appointment_Date_End);
//                 if (!doctorCode || !start || !end || end <= start) continue;

//                 const key = bookingKey(doctorCode, start);
//                 if (!bookingIndex.has(key)) bookingIndex.set(key, [b]);
//                 else bookingIndex.get(key).push(b);
//             }


//             const allDoctor = [];
//             const allXray = [];

//             for (const d of doctors) {
//                 const id = d._id;
//                 const docData = docDetailsMap[id];
//                 if (!docData) continue;

//                 const doctorName = docData?.Doctor_Name ?? "(Unknown)";
//                 const doctorCode = docData?.Doctor_Code ?? id;
//                 const weekly = Array.isArray(docData?.["Table::Weekly_Slot"]) ? docData["Table::Weekly_Slot"] : [];
//                 const offRaw = Array.isArray(docData?.["Table::Off_Day_Schedule_1"]) ? docData["Table::Off_Day_Schedule_1"] : [];
//                 const offRanges = offRaw
//                     .map(od => ({ start: parseAPIOffsetDate(od.Start_Date), end: parseAPIOffsetDate(od.End_Date), clinic: od.Clinic_Off_Day || null }))
//                     .filter(r => r.start && r.end && r.start < r.end);

//                 const doctorTypeDefault = (docData?.Doctor_Type || d.doctorType || "").toLowerCase();

//                 for (const slot of weekly) {
//                     const day = slot?.Day_of_Week;
//                     if (!day || !DOW_MAP[day]) continue;

//                     const clinic = slot?.Clinic_Weekly_Schedule ?? "";
//                     const patientType = slot?.Patient_Type ?? "Any";
//                     const slotMin = Number(slot?.Slot_Duration ?? 15);
//                     const effFrom = slot?.Effective_From ? parseDateYMD(slot.Effective_From) : viewStart;
//                     const effTill = slot?.Effective_Till ? parseDateYMD(slot.Effective_Till) : viewEnd;
//                     const [sH, sM] = String(slot?.Start_Time ?? "09:00").split(":").map(n => parseInt(n, 10) || 0);
//                     const [eH, eM] = String(slot?.End_Time ?? "12:00").split(":").map(n => parseInt(n, 10) || 0);

//                     const doctorType = (slot?.Doctor_Type ?? doctorTypeDefault ?? "").toLowerCase();
//                     const facilityName = slot?.Facilities_Name ?? slot?.Facility_Name ?? docData?.Facilities_Name ?? docData?.Facility_Name ?? "";

//                     const firstDay = firstOccurrenceOnOrAfter(effFrom, DOW_MAP[day].idx);
//                     const dtstart = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate(), sH, sM, 0, 0);

//                     const rule = new RRule({
//                         freq: RRule.WEEKLY, interval: 1, byweekday: [DOW_MAP[day].rrule], dtstart, until: effTill,
//                     });

//                     const occurDates = rule.between(viewStart, viewEnd, true);

//                     occurDates.forEach((dateOcc) => {
//                         const resource = {
//                             doctor: doctorName, doctor_code: doctorCode,
//                             clinic, type: patientType, doctor_type: doctorType, facility: facilityName,
//                         };
//                         let evs = generateSlotsForDay(dateOcc, sH, sM, eH, eM, slotMin, `${doctorName} (${day})`, resource);

//                         // ตัดวันหยุด
//                         evs = evs.filter(ev => !offRanges.some(r => {
//                             if (r.clinic && String(r.clinic) !== String(clinic)) return false;
//                             return overlaps(ev.start, ev.end, r.start, r.end);
//                         }));

//                         // Mark booked (เฉพาะ doctor)
//                         evs = evs.map(ev => {
//                             const k = bookingKey(doctorCode, ev.start);
//                             const arr = bookingIndex.get(k);
//                             if (arr && arr.length) {
//                                 const primary = arr[0];                      // ใช้รายการแรกเป็นตัวหลัก
//                                 const itemIds = arr.map(x => x.Item_ID || x._id).filter(Boolean);
//                                 const formattedTitle = buildBookedEventTitle(ev, primary);

//                                 // ถ้าชนหลายรายการ ให้เติมบรรทัดท้ายแจ้งจำนวนเพิ่ม (ทางเลือก)
//                                 const title = arr.length > 1
//                                     ? `${formattedTitle}\n(+${arr.length - 1} รายการ)`
//                                     : formattedTitle;

//                                 return {
//                                     ...ev,
//                                     booked: true,
//                                     item_ids: itemIds,
//                                     booked_count: arr.length,
//                                     title,
//                                 };
//                             }
//                             return ev;
//                         });


//                         if (doctorType === "x-ray") allXray.push(...evs);
//                         else if (selectedDoctorIds.includes(id)) allDoctor.push(...evs);
//                     });
//                 }
//             }

//             setEventsDoctor(allDoctor);

//             // 1) doctor (non x-ray) & booked-title (ส่วนเดิมของคุณ) -> setEventsDoctor(...)
//             //    ... โค้ดเดิมของคุณคงไว้ ...

//             // 2) doctor(X-ray) open ranges (ใหม่)
//             const xrayDoctorOpenRanges = buildXrayDoctorOpenRanges(docDetailsMap, viewStart, viewEnd);

//             // 3) โหลด facility index + detail แล้วคำนวณ free slots รวม
//             let facilityIndex = [];
//             let facilityEvents = [];
//             try {
//                 facilityIndex = await fetchFacilityIndex();
//                 for (const row of facilityIndex) {
//                     const formId = row.Form_ID || row._id || row.Item_ID;
//                     if (!formId) continue;
//                     const detail = await fetchFacilityDetail(formId);

//                     const evs = buildFacilityFreeEvents({
//                         facilityDetail: detail,
//                         doctorOpenRanges: xrayDoctorOpenRanges,
//                         viewStart,
//                         viewEnd
//                     });
//                     facilityEvents.push(...evs);
//                 }
//             } catch (e) {
//                 console.error("Load facility free slots failed:", e);
//             }

//             // 4) set state: facilities = aggregated free events (แทนที่ของเก่า)
//             setEventsXray(facilityEvents);
//         })();
//     }, [doctors, selectedDoctorIds, docDetailsMap, bookings]);

//     /* ===== Facilities table (legacy UX) ===== */
//     const mkRow = (name = "") => ({
//         rowId: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
//         Facilities_Name: name,
//         Start_Time: null,
//         End_Time: null,
//         Duration_Min: 15,
//         Room: "",
//         Technician: "",
//         Remark: "",
//         _linkedEventId: undefined,
//     });
//     const addEmptyFacilityRow = () => {
//         const newRow = mkRow();
//         setFacilityRows(rows => [...rows, newRow]);
//         setFocusedCell({ rowId: newRow.rowId, field: "Start_Time" });
//         setLastAddedRowId(newRow.rowId);
//     };
//     const removeFacilityRow = (rowId) => {
//         setFacilityRows(rows => {
//             const row = rows.find(r => r.rowId === rowId);
//             if (row?._linkedEventId) {
//                 setCommittedXrayIds(prev => {
//                     const next = new Set(prev);
//                     next.delete(row._linkedEventId);
//                     return next;
//                 });
//             }
//             return rows.filter(r => r.rowId !== rowId);
//         });
//         if (focusedCell?.rowId === rowId) setFocusedCell(null);
//     };

//     /* ===== Unified calendar handlers ===== */
//     const onSelectUnifiedEvent = (event) => {
//         const kind = detectKind(event);

//         if (kind === "facility") {
//             // === Facility (legacy) ===
//             if (event.booked) return;

//             setSelectedXrayEventId(prev => (prev === event.id ? null : event.id));

//             const slotFacility = event?.resource?.facility || "";
//             const ns = toLocalIsoNoMillis(event.start);
//             const ne = toLocalIsoNoMillis(event.end);
//             const dur = minutesBetween(event.start, event.end);

//             // ไม่มี focus → auto create/auto fill แถวแรกที่ว่าง
//             if (!focusedCell) {
//                 let insertedRowId = null;
//                 setFacilityRows(prev => {
//                     const idx = prev.findIndex(r => !r._linkedEventId);
//                     if (idx !== -1) {
//                         const rows = [...prev];
//                         rows[idx] = {
//                             ...rows[idx],
//                             Facilities_Name: rows[idx].Facilities_Name || slotFacility,
//                             Start_Time: ns,
//                             End_Time: ne,
//                             Duration_Min: dur,
//                             _linkedEventId: event.id,
//                         };
//                         insertedRowId = rows[idx].rowId;
//                         return rows;
//                     }
//                     const newRow = {
//                         rowId: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
//                         Facilities_Name: "",
//                         Start_Time: ns, End_Time: ne, Duration_Min: dur,
//                         Room: "", Technician: "", Remark: "",
//                         _linkedEventId: event.id,
//                     };
//                     insertedRowId = newRow.rowId;
//                     return [...prev, newRow];
//                 });
//                 setCommittedXrayIds(prev => { const s = new Set(prev); s.add(event.id); return s; });
//                 if (insertedRowId) {
//                     setFocusedCell({ rowId: insertedRowId, field: "Start_Time" });
//                     setLastAddedRowId(insertedRowId);
//                 }
//                 return;
//             }

//             // มี focus → อัปเดตแถวนั้น และแทน commit เดิมถ้ามี
//             const { rowId, field } = focusedCell;
//             let prevLinkedId = null;
//             setFacilityRows(prev => prev.map(r => {
//                 if (r.rowId !== rowId) return r;
//                 prevLinkedId = r._linkedEventId || null;

//                 if (field === "Start_Time") {
//                     // ✅ กรณีเลือก Start_Time → ให้ End_Time เปลี่ยนตาม slot ด้วย
//                     var nextStart = field === "Start_Time" ? ns : (r.Start_Time || ns);
//                     var nextEnd = ne;
//                     var nextDur = (nextStart && nextEnd)
//                         ? minutesBetween(new Date(nextStart), new Date(nextEnd))
//                         : (r.Duration_Min || dur);
//                 }

//                 return {
//                     ...r,
//                     Facilities_Name: r.Facilities_Name || slotFacility,
//                     Start_Time: nextStart,
//                     End_Time: nextEnd,
//                     Duration_Min: nextDur,
//                     _linkedEventId: event.id,
//                 };
//             }));
//             setCommittedXrayIds(prev => {
//                 const s = new Set(prev);
//                 if (prevLinkedId) s.delete(prevLinkedId);
//                 s.add(event.id);
//                 return s;
//             });
//             setFocusedCell(null);
//             return;
//         }

//         if (kind === "doctor") {
//             if (event.booked) return;
//             setSelectedDoctorEvent(prev => (prev && prev.id === event.id ? null : event));
//             setCommittedDoctorId(prev => (prev === event.id ? null : event.id));
//             return;
//         }

//         if (kind === "or") {
//             // เลือกได้ทีละ 1
//             if (event?.resource?.status === "Tentative") {
//                 setSelectedOrEventId(prev => prev === event.id ? null : event.id);
//             }
//             return;
//         }
//     };

//     // Drag to create OR tentative (เปิดเฉพาะเมื่อ orDrawMode = true)
//     const onSelectSlotUnified = ({ start, end, action }) => {
//         if (!orDrawMode) return;
//         if (action !== "select") return;

//         const id = `OR_T_${Date.now()}`;
//         const blockStart = addMin(start, -OR_DEFAULT_SETUP_MIN);
//         const blockEnd = addMin(end, OR_DEFAULT_CLEANUP_MIN);

//         const newEv = {
//             id,
//             title: `Tentative • OR`,
//             start,
//             end,
//             resource: { or: "", status: "Tentative" },
//             blockStart,
//             blockEnd,
//         };

//         setEventsOR(prev => [...prev, newEv]);

//         // ✅ Auto-select OR ที่เพิ่งสร้าง
//         setSelectedOrEventId(id);

//         // (ถ้าต้องการ: ปิดโหมดลากทันทีหลังสร้าง 1 รายการ)
//         // setOrDrawMode(false);

//         // เก็บ preview payload ไว้ log ตอน Confirm ด้วย
//         orPreviewRef.current = {
//             Procedure_Start: toLocalIsoNoMillis(start),
//             Procedure_End: toLocalIsoNoMillis(end),
//             Setup_Buffer_Min: OR_DEFAULT_SETUP_MIN,
//             Cleanup_Buffer_Min: OR_DEFAULT_CLEANUP_MIN,
//             Resource_Locks: [{
//                 Type: "OR",
//                 Key: "",
//                 Start: toLocalIsoNoMillis(blockStart),
//                 End: toLocalIsoNoMillis(blockEnd),
//             }],
//             Status: "Tentative",
//         };

//         console.log("OR TENTATIVE (preview payload):", orPreviewRef.current);
//     };



//     const handleDeleteTentativeOR = () => {
//         if (!selectedOrEventId) return;
//         const ev = eventsOR.find(e => e.id === selectedOrEventId);
//         if (!ev || ev?.resource?.status !== "Tentative") return;
//         Modal.confirm({
//             title: "ลบ OR (Tentative) นี้?",
//             okText: "ลบ", okButtonProps: { danger: true }, cancelText: "ยกเลิก",
//             onOk: () => {
//                 setEventsOR(prev => prev.filter(x => x.id !== selectedOrEventId));
//                 setSelectedOrEventId(null);
//             }
//         });
//     };

//     /* ===== Coloring for unified calendar (doctor/facility/or) ===== */
//     const eventPropGetterUnified = (event) => {
//         const kind = detectKind(event);

//         // Confirmed = เทา
//         if (kind === "doctor" && confirmedDoctorIds.has(event.id))
//             return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };
//         if (kind === "facility" && confirmedXrayIds.has(event.id))
//             return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };
//         if (kind === "or" && event?.resource?.status === "Confirmed")
//             return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };

//         // booked (เฉพาะ doctor)
//         if (kind === "doctor" && event.booked)
//             return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };

//         // base color
//         let style = { border: 0 };
//         if (kind === "doctor") style = { ...style, backgroundColor: "#3b82f6", color: "#fff" };
//         if (kind === "facility") {
//             const fac = event?.resource?.facility || "";
//             style = { ...style, backgroundColor: facilityColor(fac), color: facilityTextColor() };
//         }
//         if (kind === "or") {
//             style = { ...style, backgroundColor: event?.resource?.status === "Tentative" ? "#a78bfa" : "#6b7280", color: "#fff" };
//             if (selectedOrEventId === event.id && event?.resource?.status === "Tentative") {
//                 style.outline = "2px solid #dc2626";
//             }
//             return { style };
//         }

//         // selected / committed
//         const selected =
//             (kind === "doctor" && selectedDoctorEvent?.id === event.id) ||
//             (kind === "facility" && selectedXrayEventId === event.id);

//         const committed =
//             (kind === "doctor" && committedDoctorId === event.id) ||
//             (kind === "facility" && committedXrayIds.has(event.id));

//         if (selected) style = { ...style, outline: "2px solid #1d4ed8", boxShadow: "0 0 0 2px #1d4ed8 inset" };
//         if (committed) style = { ...style, outline: "2px solid #16a34a", boxShadow: "0 0 0 2px #16a34a inset" };

//         return { style };
//     };

//     /* ===== Legend x-ray (optional) ===== */
//     const facilityLegend = useMemo(() => {
//         const set = new Set(eventsXray.map(e => e?.resource?.facility).filter(Boolean));
//         return Array.from(set);
//     }, [eventsXray]);

//     /* ===== Confirm (ยืดหยุ่น: จะเลือก Doctor, หรือ Facility, หรือ OR อย่างใดอย่างหนึ่ง/หลายอย่างก็ได้) ===== */
//     function buildHeaderFromDoctor(ev) {
//         if (!ev) return null;
//         const startIso = toLocalIsoNoMillis(ev.start);
//         const endIso = toLocalIsoNoMillis(ev.end);
//         const duration = minutesBetween(ev.start, ev.end) || 15;
//         return {
//             Doctor_Name: ev?.resource?.doctor || "",
//             Doctor_Code: ev?.resource?.doctor_code || "",
//             Clinic: ev?.resource?.clinic || "",
//             Appointment_Start_Time: startIso,
//             Appointment_End_Time: endIso,
//             Duration: duration,
//             Patient_Type: ev?.resource?.type || "",
//         };
//     }
//     const normalizeLocal = (v) => {
//         if (!v) return null;
//         const d = new Date(v);
//         if (!isNaN(d)) return toLocalIsoNoMillis(d);
//         const m = String(v).match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
//         return m ? `${m[1]}:00` : String(v);
//     };

//     // คืน array ของ Item_ID ที่ทับช่วง OR สำหรับหมอ code ที่ระบุ
//     // === NEW: หา doctor slot ที่ทับช่วง OR ===
//     function getOverlappingDoctorSlotIds(orStart, orEnd, doctorEvents, surgeonFilterCode = null) {
//         if (!orStart || !orEnd) return [];
//         const ids = [];
//         for (const ev of doctorEvents) {
//             // ข้าม X-ray และที่ถูก mark ว่าเป็น facility/or
//             const kind = (ev._kind) || ((ev?.resource?.status) ? "or" : ((ev?.resource?.doctor_type || "").toLowerCase() === "x-ray" ? "facility" : "doctor"));
//             if (kind !== "doctor") continue;

//             // ถ้ากำหนดให้ดูเฉพาะ Surgeon ที่เลือก
//             if (surgeonFilterCode) {
//                 const code = ev?.resource?.doctor_code || "";
//                 if (String(code) !== String(surgeonFilterCode)) continue;
//             }

//             if (overlaps(orStart, orEnd, ev.start, ev.end)) {
//                 ids.push(ev.id);
//             }
//         }
//         return ids;
//     }

//     // หา Item_ID ของ booking ที่ทับช่วง OR จาก bookings
//     function getImpactItemIdsFromMockBookings(orStart, orEnd, {
//         onlyDoctorCode = null,           // ถ้ามี ให้เช็คเฉพาะหมอคนนั้น (เช่น Surgeon)
//         includeDoctorCodes = null,       // หรือส่งเป็น array ของรหัสหมอที่ต้องการเช็ค (เช่น หมอที่เลือกใน dropdown)
//     } = {}) {
//         if (!orStart || !orEnd) return [];

//         const wantSet = includeDoctorCodes
//             ? new Set(includeDoctorCodes.filter(Boolean).map(String))
//             : null;

//         const out = [];
//         for (const b of bookings) {
//             const code = String(b.Doctor_Code || "").trim();
//             if (onlyDoctorCode && code !== String(onlyDoctorCode)) continue;
//             if (!onlyDoctorCode && wantSet && !wantSet.has(code)) continue;

//             const s = parseAPIOffsetDate(b.Appointment_Date_Start);
//             const e = parseAPIOffsetDate(b.Appointment_Date_End);
//             if (!s || !e || e <= s) continue;

//             if (overlaps(orStart, orEnd, s, e)) {
//                 out.push(b.Item_ID || b._id);
//             }
//         }
//         // unique
//         return Array.from(new Set(out));
//     }


//     // Surgeon สำหรับ OR (อิงจาก dropdown เดียวกับ Doctor Slot)
//     const [selectedSurgeonId, setSelectedSurgeonId] = useState(null);

//     // ถ้าเลือกหมอ 1 คน → ตั้งเป็น Surgeon อัตโนมัติ
//     // ถ้า 0 คน → เคลียร์ Surgeon, ถ้ามากกว่า 1 คน → รอให้ผู้ใช้เลือกจาก mini-select
//     useEffect(() => {
//         if (selectedDoctorIds.length === 1) {
//             setSelectedSurgeonId(selectedDoctorIds[0]);
//         } else if (selectedDoctorIds.length === 0) {
//             setSelectedSurgeonId(null);
//         } else {
//             // หลายคน: คงค่าเดิมไว้ถ้ายังอยู่ในลิสต์, ถ้าไม่อยู่แล้วให้เป็น null
//             setSelectedSurgeonId(prev =>
//                 prev && selectedDoctorIds.includes(prev) ? prev : null
//             );
//         }
//     }, [selectedDoctorIds]);




//     const handleConfirm = async () => {
//         const rowsLinked = facilityRows.filter(r => !!r._linkedEventId);
//         const orEv = eventsOR.find(ev => ev.id === selectedOrEventId && ev?.resource?.status === "Tentative");

//         if (!selectedDoctorEvent && rowsLinked.length === 0 && !orEv) {
//             console.log("กรุณาเลือกอย่างน้อย 1 รายการ (Doctor หรือ Facility หรือ OR)");
//             return;
//         }

//         // Header (Doctor) สำหรับคิวตรวจปกติ
//         const header = buildHeaderFromDoctor(selectedDoctorEvent);

//         // Facilities (legacy) payload
//         const facilitiesPayload = rowsLinked.map(r => ({
//             Facility_Name: r.Facilities_Name,
//             Start_Time_Facility: normalizeLocal(r.Start_Time),
//             End_Time_Facility: normalizeLocal(r.End_Time),
//         }));

//         // Surgeon object (จาก dropdown) — ใช้เฉพาะถ้าต้องการ filter impact เฉพาะหมอคนนี้
//         let surgeon = null;
//         if (selectedDoctorIds.length === 1) {
//             surgeon = doctors.find(d => d._id === selectedDoctorIds[0]);
//         } else if (selectedDoctorIds.length > 1 && selectedSurgeonId) {
//             surgeon = doctors.find(d => d._id === selectedSurgeonId);
//         }
//         const surgeonName = surgeon?.name || "";
//         const surgeonCode = surgeon?.code || "";

//         // OR payload (optional)
//         let orPayload = null;
//         let orPreviewForLog = null;
//         if (orEv) {
//             const blockStart = orEv.blockStart || addMin(orEv.start, -OR_DEFAULT_SETUP_MIN);
//             const blockEnd = orEv.blockEnd || addMin(orEv.end, OR_DEFAULT_CLEANUP_MIN);

//             orPayload = {
//                 Start_Time_OR: toLocalIsoNoMillis(orEv.start),
//                 End_Time_OR: toLocalIsoNoMillis(orEv.end),
//                 "Table::Physician_OR": [{
//                     "Physician_Name": surgeonName,
//                     "Role": "แพทย์ผ่าตัด (Surgeon)"
//                 }]
//             };

//             orPreviewForLog = orPreviewRef.current ?? {
//                 Procedure_Start: toLocalIsoNoMillis(orEv.start),
//                 Procedure_End: toLocalIsoNoMillis(orEv.end),
//                 Setup_Buffer_Min: OR_DEFAULT_SETUP_MIN,
//                 Cleanup_Buffer_Min: OR_DEFAULT_CLEANUP_MIN,
//                 Resource_Locks: [{
//                     Type: "OR",
//                     Key: orEv?.resource?.or || "",
//                     Start: toLocalIsoNoMillis(blockStart),
//                     End: toLocalIsoNoMillis(blockEnd),
//                 }],
//                 Status: "Tentative",
//             };
//         }

//         // === NEW: IMPACT จาก "Doctor Slots" ที่ทับช่วง OR ===
//         // ถ้าเลือก Surgeon ใน dropdown → จะคำนวณ impact เฉพาะ slot ของหมอคนนั้น
//         // ถ้าไม่ได้เลือก → จะดูทุก doctor slot non X-ray ที่แสดงในปัจจุบัน
//         // หา Surgeon จาก dropdown เดียวกับ Doctor Slot



//         // === Impact จาก Doctor Slot ที่ทับช่วง OR (ถ้ามี OR) ===
//         // ... โค้ดก่อนหน้าเลือก orEv, surgeonName/surgeonCode ฯลฯ ...

//         // === Impact จากนัดเดิม (bookings) ที่ทับช่วง OR ===
//         let impactIds = [];
//         if (orEv) {
//             // ตัวเลือก 1: ถ้าเลือก Surgeon แล้ว → ตรวจเฉพาะนัดของ Surgeon คนนั้น
//             if (surgeonCode) {
//                 impactIds = getImpactItemIdsFromMockBookings(orEv.start, orEv.end, {
//                     onlyDoctorCode: surgeonCode,
//                 });
//             } else {
//                 // ตัวเลือก 2: ถ้ายังไม่ได้เลือก Surgeon
//                 //    ถ้ามีเลือกหมอใน dropdown → ตรวจเฉพาะรหัสหมอชุดนั้น
//                 //    ไม่งั้น → ตรวจทั้งหมดใน bookings
//                 let includeCodes = null;
//                 if (selectedDoctorIds.length > 0) {
//                     includeCodes = selectedDoctorIds
//                         .map(id => doctors.find(d => d._id === id)?.code)
//                         .filter(Boolean);
//                 }
//                 impactIds = getImpactItemIdsFromMockBookings(orEv.start, orEv.end, {
//                     includeDoctorCodes: includeCodes || null,
//                 });
//             }
//         }
//         const impactStr = impactIds.join(",");

//         // รวม payload
//         const payload = {
//             ...(header || {}),
//             ...(facilitiesPayload.length ? { "Table::Facility": facilitiesPayload } : {}),
//             ...(orPayload || {}),
//             ...(impactStr ? { "Impact_Doctor_Slot_ID": impactStr } : {}),
//         };

//         console.log("✅ FINAL CONFIRM PAYLOAD:", payload);
//         if (orPreviewForLog) console.log("OR TENTATIVE (preview payload) — at confirm:", orPreviewForLog);

//         // (UI) mark confirmed
//         if (selectedDoctorEvent) setConfirmedDoctorIds(prev => new Set([...prev, selectedDoctorEvent.id]));
//         if (rowsLinked.length) {
//             const linkedIds = rowsLinked.map(r => r._linkedEventId).filter(Boolean);
//             setConfirmedXrayIds(prev => { const s = new Set(prev); linkedIds.forEach(id => s.add(id)); return s; });
//         }
//         if (orEv) {
//             setEventsOR(prev => prev.map(ev => ev.id === orEv.id
//                 ? { ...ev, title: (ev.title || "").replace("Tentative", "Confirmed"), resource: { ...(ev.resource || {}), status: "Confirmed" } }
//                 : ev
//             ));
//             setSelectedOrEventId(null);
//         }

//         // ยิง API ตามเดิม…
//         try {
//             let account_id = await kf.account._id
//             const resp = await kf.api(
//                 `/process/2/${account_id}/Appointment_A01?application_id=Hospital_Information_Systems_HIS_A00`,
//                 { method: "POST", body: JSON.stringify(payload) }
//             );
//             console.log(resp);
//             console.info("InstanceID", resp._id, resp._activity_instance_id);
//             kf.app.page.openPopup("Popup_OyjYD4jX5R", {
//                 popinstanceid: resp._id,
//                 popactiveinstanceid: resp._activity_instance_id,
//             });
//         } catch (err) {
//             console.error("New item failed:", err);
//             kf.client.showInfo("❌ สร้างรายการไม่สำเร็จ");
//         }
//     };




//     const handleReset = () => {
//         setSelectedDoctorEvent(null);
//         setSelectedXrayEventId(null);
//         setSelectedOrEventId(null);
//         setCommittedDoctorId(null);
//         setCommittedXrayIds(new Set());
//         setConfirmedDoctorIds(new Set());
//         setConfirmedXrayIds(new Set());
//         setFacilityRows([]);
//         setFocusedCell(null);
//         // คง OR ที่ Confirmed ไว้, ลบ Tentative ออก
//         setEventsOR(prev => prev.filter(ev => ev?.resource?.status === "Confirmed"));
//     };

//     /* ===== Merge events (doctor + facility + OR) ===== */
//     const unifiedEvents = useMemo(() => {
//         const tag = (ev, kind) => ({ ...ev, _kind: kind });
//         return [
//             ...eventsDoctor.map(e => tag(e, "doctor")),
//             ...eventsXray.map(e => tag(e, "facility")),
//             ...eventsOR.map(e => tag(e, "or")),
//         ];
//     }, [eventsDoctor, eventsXray, eventsOR]);

//     function detectKind(event) {
//         if (event._kind) return event._kind;
//         if (event?.resource?.status) return "or";
//         if ((event?.resource?.doctor_type || "").toLowerCase() === "x-ray" || event?.aggregated) return "facility";
//         return "doctor";
//     }
//     const formatThaiDate = (isoDate) => {
//         if (!isoDate) return "";
//         return new Intl.DateTimeFormat("th-TH", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             hour12: false
//         }).format(new Date(isoDate));
//     };

//     /* =========================
//     * Render
//     * ========================= */
//     return (
//         <div style={{ height: "100%", minHeight: 560, padding: 0 }}>
//             {/* Filters + OR tools */}
//             <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "end", marginBottom: 12 }}>
//                 <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//                     <div>
//                         <label style={{ display: "block", marginBottom: 6 }}>เลือกคลินิก :</label>
//                         <Select
//                             allowClear style={{ width: 320 }}
//                             value={selectedClinic ?? undefined}
//                             onChange={(v) => setSelectedClinic(v ?? null)}
//                             options={clinicOptions}
//                             showSearch optionFilterProp="label" placeholder="เลือกคลินิก…"
//                         />
//                     </div>
//                     {/* เดิม: เลือกแพทย์ (ใช้กรอง Doctor Slot + เป็นแหล่งเลือก Surgeon) */}
//                     <div>
//                         <label style={{ display: "block", marginBottom: 6 }}>เลือกแพทย์ :</label>
//                         <Select
//                             mode="multiple"
//                             style={{ width: 520 }}
//                             value={selectedDoctorIds}
//                             onChange={setSelectedDoctorIds}
//                             options={filteredDoctorsNonXray.map(d => ({ value: d._id, label: `${d.name} — (${d.code || d._id})` }))}
//                             showSearch
//                             optionFilterProp="label"
//                             placeholder="เลือกแพทย์…"
//                         />
//                         {/* ถ้าเลือกหมอมากกว่า 1 คน ให้เลือก Surgeon จากรายชื่อที่เลือก (แหล่งข้อมูลมาจาก dropdown เดิม) */}
//                         {selectedDoctorIds.length > 1 && (
//                             <div style={{ marginTop: 6 }}>
//                                 <label style={{ display: "block", marginBottom: 4 }}>เลือก Surgeon (จากรายชื่อแพทย์ที่เลือก):</label>
//                                 <Select
//                                     allowClear
//                                     style={{ width: 360 }}
//                                     value={selectedSurgeonId ?? undefined}
//                                     onChange={(v) => setSelectedSurgeonId(v ?? null)}
//                                     options={selectedDoctorIds
//                                         .map(id => doctors.find(d => d._id === id))
//                                         .filter(Boolean)
//                                         .map(d => ({ value: d._id, label: `${d.name} — (${d.code || d._id})` }))
//                                     }
//                                     placeholder="เลือก Surgeon…"
//                                     showSearch
//                                     optionFilterProp="label"
//                                 />
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                     <span>ลากเพื่อสร้าง OR:</span>
//                     <Switch checked={orDrawMode} onChange={setOrDrawMode} />
//                     <Button disabled={!selectedOrEventId} danger onClick={handleDeleteTentativeOR}>ลบ OR (Tentative)</Button>
//                 </div>

//                 <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
//                     <Button type="primary" onClick={handleConfirm}>Confirm</Button>
//                     <Button onClick={handleReset}>Reset</Button>
//                 </div>
//             </div>

//             {/* Facilities Usage (legacy) */}
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
//                 <div style={{ fontWeight: 600 }}>
//                     Facilities Usage
//                 </div>
//                 <button
//                     onClick={addEmptyFacilityRow}
//                     style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #999", background: "#fff", cursor: "pointer" }}
//                 >
//                     + เพิ่ม Facility
//                 </button>
//             </div>

//             {facilityRows.map((r, idx) => (
//                 <div key={r.rowId}
//                     style={{
//                         display: "grid",
//                         gridTemplateColumns: "1.2fr 1.4fr 1.4fr 0.8fr 1fr 1fr auto",
//                         gap: 8, marginBottom: 8
//                     }}>
//                     <Select
//                         value={r.Facilities_Name || undefined}
//                         onChange={(val) => setFacilityRows(rows => rows.map((x, i) => i === idx ? { ...x, Facilities_Name: val } : x))}
//                         options={facilities} placeholder="เลือก Facilities_Name"
//                         showSearch optionFilterProp="label"
//                     />
//                     <Input
//                         ref={(el) => setInputRef(`Start_Time:${r.rowId}`, el)}
//                         value={r.Start_Time || ""}
//                         readOnly   // ✅ prevents typing, but still allows focus
//                         onFocus={() => setFocusedCell({ rowId: r.rowId, field: "Start_Time" })}
//                         placeholder="Start_Time (โฟกัส แล้วคลิก slot ฝั่ง Facility)"
//                     />
//                     <Input disabled
//                         value={r.End_Time || ""}
//                         onFocus={() => setFocusedCell({ rowId: r.rowId, field: "End_Time" })}
//                         onChange={(e) => setFacilityRows(rows => rows.map((x, i) => i === idx ? { ...x, End_Time: e.target.value } : x))}
//                         placeholder="End_Time (โฟกัส แล้วคลิก slot ฝั่ง Facility)"
//                     />
//                     <Input disabled value={r.Duration_Min} placeholder="Duration (min)" />
//                     {/* <Input disabled placeholder="Room" value={r.Room} />
//                         <Input disabled placeholder="Technician" value={r.Technician} /> */}
//                     <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
//                         <button
//                             onClick={() => removeFacilityRow(r.rowId)}
//                             style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #e11", background: "#fff", color: "#e11", cursor: "pointer" }}
//                         >
//                             ลบ
//                         </button>
//                     </div>
//                 </div>
//             ))}

//             {/* ปฏิทินรวม */}
//             <Calendar
//                 selectable={orDrawMode}             // เปิดลากเฉพาะตอนสร้าง OR
//                 localizer={localizer}
//                 events={unifiedEvents}
//                 startAccessor="start"
//                 endAccessor="end"
//                 defaultView="week"
//                 views={["day", "week", "month"]}
//                 step={15}
//                 min={new Date(2025, 0, 1, 6, 0)}
//                 max={new Date(2025, 0, 1, 20, 0)}
//                 onSelectEvent={onSelectUnifiedEvent}
//                 onSelectSlot={onSelectSlotUnified}
//                 eventPropGetter={eventPropGetterUnified}
//                 style={{ height: 720, background: "#fff", marginTop: 8 }}
//             />

//             {/* (optional) legend ของ Facility */}
//             {/* <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:8 }}>
//             {facilityLegend.map(name => (
//             <span key={name} style={{
//                 display:"inline-flex", alignItems:"center", gap:6, padding:"2px 8px",
//                 borderRadius:999, background: facilityColor(name), color:"#fff", fontSize:12
//             }}>
//                 {name}
//             </span>
//             ))}
//         </div> */}
//         </div>
//     );
// }

// ----------------------------------------------------------------------------------------------------------------------------------

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Calendar, dateFnsLocalizer } from "react-big-calendar";
// import { RRule } from "rrule";
// import {
//   format, parse, startOfWeek, getDay,
//   addDays, addMinutes
// } from "date-fns";
// import enUS from "date-fns/locale/en-US";
// import { th } from 'date-fns/locale';
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { Select, Input, Switch, Button, Modal } from "antd";

// /* =========================
// * Localizer
// * ========================= */
// const locales = { "th-TH": th };
// const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// /* =========================
// * OR Defaults
// * ========================= */
// const OR_DEFAULT_SETUP_MIN = 0;
// const OR_DEFAULT_CLEANUP_MIN = 0;

// /* =========================
// * 🔧 PRE-DEFINED INPUT DATA (ตัวอย่าง)
// * หมายเหตุ:
// * - ค่าพวกนี้จะถูกใช้ตั้งต้นให้กับทุกอินพุต (dropdown/text) โดยไม่รอผู้ใช้
// * - การแสดง slot ใน Calendar ยังดึงจาก API เดิมเหมือนเดิม แต่จะอิงตัวเลือกจากค่าพรีดีไฟน์นี้
// * ========================= */
// const PREDEFINED = {
//   filters: {
//     // ชื่อคลินิกต้องมีอยู่จริงในข้อมูลแพทย์ที่โหลดมา (ถ้าไม่พบ ระบบจะ fallback เป็นตัวแรกในลิสต์)
//     clinic: "General Surgery", 
//     // เลือกหมอด้วย "รหัสหมอ" (Doctor_Code) เพื่อ map -> _id หลังโหลดจาก API
//     doctorCodes: ["100001"],
//   },
//   facilitiesTable: [
//     {
//       Facilities_Name: "X-ray",
//       Start_Time: "2025-10-10T09:00:00+07:00 Asia/Bangkok",
//       End_Time:   "2025-10-10T09:15:00+07:00 Asia/Bangkok",
//       Duration_Min: 15,
//     //   Room: "XR-101",
//     //   Technician: "Tech A",
//     //   Remark: "Walk-in",
//     },
//     // {
//     //   Facilities_Name: "X-ray Room 2",
//     //   Start_Time: "2025-10-10T09:15:00+07:00 Asia/Bangkok",
//     //   End_Time:   "2025-10-10T09:30:00+07:00 Asia/Bangkok",
//     //   Duration_Min: 15,
//     // //   Room: "XR-102",
//     // //   Technician: "Tech B",
//     // //   Remark: "",
//     // }
//   ],
//   // เปิด/ปิดโหมดลากสร้าง OR ตั้งต้น (แนะนำให้ปิด หากต้องการแสดงผลจากพรีดีไฟน์เฉยๆ)
//   orDrawMode: false,
// };

// /* =========================
// * Helpers
// * ========================= */
// const pad2 = (n) => String(n).padStart(2, "0");

// function parseDateYMD(str) {
//   if (!str) return null;
//   const [y, m, d] = String(str).split("-").map(n => parseInt(n, 10));
//   return new Date(y, (m || 1) - 1, d || 1);
// }
// function parseAPIOffsetDate(str) {
//   if (!str) return null;
//   const isoWithOffset = String(str).split(" Asia/")[0];
//   const dt = new Date(isoWithOffset);
//   return isNaN(dt) ? null : dt;
// }
// function toLocalIsoNoMillis(date) {
//   const y = date.getFullYear();
//   const M = pad2(date.getMonth() + 1);
//   const d = pad2(date.getDate());
//   const h = pad2(date.getHours());
//   const m = pad2(date.getMinutes());
//   return `${y}-${M}-${d}T${h}:${m}:00Z`;
// }
// function minutesBetween(a, b) {
//   return Math.max(1, Math.round((b.getTime() - a.getTime()) / 60000));
// }
// function overlaps(aStart, aEnd, bStart, bEnd) { return aStart < bEnd && bStart < aEnd; }
// function addMin(dt, min) { return new Date(dt.getTime() + min * 60000); }

// function generateSlotsForDay(date, startH, startM, endH, endM, slotMinutes, title, resource) {
//   const slots = [];
//   let start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startH, startM);
//   const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endH, endM);
//   while (start < end) {
//     const slotEnd = addMinutes(start, slotMinutes);
//     slots.push({
//       id: `${resource.doctor_code || resource.facility || "res"}_${date.toDateString()}_${pad2(start.getHours())}:${pad2(start.getMinutes())}`,
//       title,
//       start: new Date(start),
//       end: slotEnd,
//       resource,
//     });
//     start = slotEnd;
//   }
//   return slots;
// }
// const DOW_MAP = {
//   Sun: { rrule: RRule.SU, idx: 0 },
//   Mon: { rrule: RRule.MO, idx: 1 },
//   Tue: { rrule: RRule.TU, idx: 2 },
//   Wed: { rrule: RRule.WE, idx: 3 },
//   Thu: { rrule: RRule.TH, idx: 4 },
//   Fri: { rrule: RRule.FR, idx: 5 },
//   Sat: { rrule: RRule.SA, idx: 6 },
// };
// function firstOccurrenceOnOrAfter(effFromDate, dowIdx) {
//   const d = new Date(effFromDate);
//   const delta = (dowIdx - d.getDay() + 7) % 7;
//   d.setDate(d.getDate() + delta);
//   return d;
// }
// function bookingKey(doctorCode, startDate) {
//   const y = startDate.getFullYear();
//   const M = pad2(startDate.getMonth() + 1);
//   const d = pad2(startDate.getDate());
//   const h = pad2(startDate.getHours());
//   const m = pad2(startDate.getMinutes());
//   return `${doctorCode}__${y}-${M}-${d}T${h}:${m}:00`;
// }

// /** รวม “ว่าง N คิว” เฉพาะ X-ray โดยแยกตาม เวลา+Facility */
// function aggregateFreeSlotsByTimeAndFacility(events) {
//   const groups = new Map();
//   const keep = [];
//   for (const ev of events) {
//     if (ev.booked) { keep.push(ev); continue; }
//     const startKey = toLocalIsoNoMillis(ev.start);
//     const facility = ev?.resource?.facility || "";
//     const k = `${startKey}__${facility}`;
//     if (!groups.has(k)) {
//       groups.set(k, { start: ev.start, end: ev.end, list: [ev], facility });
//     } else {
//       const g = groups.get(k);
//       g.list.push(ev);
//       if (ev.end > g.end) g.end = ev.end;
//     }
//   }
//   for (const [, g] of groups) {
//     if (g.list.length === 1) {
//       const ev = g.list[0];
//       keep.push({ ...ev, title: `ว่าง 1 คิว` });
//     } else {
//       const sample = g.list[0];
//       keep.push({
//         id: `agg_${toLocalIsoNoMillis(g.start)}_${g.facility}`,
//         title: `ว่าง ${g.list.length} คิว`,
//         start: g.start,
//         end: g.end,
//         resource: { ...sample.resource, facility: g.facility },
//         aggregated: true,
//         free_count: g.list.length,
//       });
//     }
//   }
//   return keep;
// }

// // แปลงเวลาจากสตริง API ที่มี +07:00 Asia/Bangkok → เป็น Date
// function parseAPITimeMaybe(s) {
//   if (!s) return null;
//   return parseAPIOffsetDate(s);
// }

// // ฟอร์แมตช่วงเวลา HH:mm - HH:mm
// function fmtTimeRange(start, end) {
//   if (!(start instanceof Date) || isNaN(start)) return "";
//   if (!(end instanceof Date) || isNaN(end)) return format(start, "HH:mm");
//   return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
// }

// // สกัดชื่อคนไข้
// function getPatientNameFromBooking(b) {
//   if (!b) return "";
//   if (b.Patient_Name) return String(b.Patient_Name);
//   const p = [b.Prefix_Name, b.First_Name, b.Last_Name].filter(Boolean).join(" ").trim();
//   return p || "";
// }

// // สกัด Concat Facility + เวลา จาก booking
// function getFacilityLineFromBooking(b) {
//   if (!b) return "";
//   const rows = Array.isArray(b["Table::Facility"]) ? b["Table::Facility"] : null;
//   if (rows && rows.length) {
//     return rows.map((r) => {
//       const name = r.Facility_Name || r.Facilities_Name || "";
//       const st = parseAPITimeMaybe(r.Start_Time_Facility || r.Start_Time);
//       const et = parseAPITimeMaybe(r.End_Time_Facility || r.End_Time);
//       const time = fmtTimeRange(st, et);
//       if (!name && !time) return "";
//       return `${name}${time ? ` : ${time}` : ""}`;
//     }).filter(Boolean).join(" | ");
//   }
//   const name = b.Concat_Facility_Name || b.Facility_Name || b.Facilities_Name || "";
//   const st = parseAPITimeMaybe(b.Start_Time_Facility || b.Start_Time_Facility_1);
//   const et = parseAPITimeMaybe(b.End_Time_Facility || b.End_Time_Facility_1);
//   const time = fmtTimeRange(st, et);
//   if (!name && !time) return "";
//   return `${name}${time ? ` : ${time}` : ""}`;
// }

// // ✅ ชื่อ title สำหรับ slot ที่ถูกจอง
// function buildBookedEventTitle(ev, bookingDetail) {
//   const patient = getPatientNameFromBooking(bookingDetail);
//   const doctor = bookingDetail?.Doctor_Name || ev?.resource?.doctor || "";
//   const facLine = getFacilityLineFromBooking(bookingDetail);
//   return [patient, doctor, facLine].filter(Boolean).join("\n");
// }

// /* สีสำหรับ Facility */
// function hashStr(s = "") { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
// function facilityColor(name = "") { if (!name) return "#06b6d4"; const h = hashStr(name) % 360; return `hsl(${h} 70% 48%)`; }
// function facilityTextColor() { return "#fff"; }

// /* ===== KF view config for All ===== */
// const ACCOUNT_ID = "Ac7wE0VDRiSM";
// const APP_ID = "Hospital_Information_Systems_HIS_A00";

// /* ===== KF view config for doctors data ===== */
// const DATAFORM_ID = "Weekly_Slot_Dataform_A00";
// const VIEW_ID = "Add_Data_A05";
// const PAGE_SIZE = 500;

// const uniq = (arr) => Array.from(new Set(arr));
// function splitClinics(str) {
//   return String(str || "")
//     .split(",")
//     .map((s) => s.trim())
//     .filter(Boolean);
// }

// /* ===== KF detail-view config (per doctor) ===== */
// const FORM_SLUG = "Weekly_Slot_Dataform_A00";
// const DETAIL_VIEW_SLUG = "View_Table_A00";

// /* ===== Appointments view (bookings) ===== */
// const APPT_FORM_SLUG = "Appointment_Transaction_A00";
// const APPT_VIEW_SLUG = "Add_Data_A50";
// const APPT_PAGE_SIZE = 500;

// /* ===== Facilities view (options for the Facilities select) ===== */
// const FAC_FORM_SLUG = "Facilities_Slot_Master_A00";
// const FAC_VIEW_SLUG = "Add_Data_A51";
// const FAC_PAGE_SIZE = 500;

// function toStr(x) { return x == null ? "" : String(x).trim(); }
// function normalizeFacilityRow(row) {
//   const text = toStr(
//     row.Facilities_Name ??
//     row.Facility_Name ??
//     row.Facility ??
//     row.Name ??
//     row.label ??
//     row.value ??
//     ""
//   );
//   return text ? { value: text, label: text } : null;
// }
// function uniqueOptions(options) {
//   const map = new Map();
//   for (const o of options) {
//     if (!o || !o.value) continue;
//     if (!map.has(o.value)) map.set(o.value, o);
//   }
//   return Array.from(map.values());
// }
// export function facilitiesToOptions(rows) {
//   if (!Array.isArray(rows)) return [];
//   return uniqueOptions(rows.map(normalizeFacilityRow).filter(Boolean));
// }

// /* =========================
// * Component
// * ========================= */
// export default function UnifiedCalendar_OR_WithLegacyFacility_Predefined() {
//   // Doctors/Clinics
//   const [doctors, setDoctors] = useState([]);
//   const [clinicOptions, setClinicOptions] = useState([]);
//   const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);
//   const [selectedClinic, setSelectedClinic] = useState(PREDEFINED.filters.clinic ?? null);
//   const [docDetailsMap, setDocDetailsMap] = useState({});

//   // Facilities rows (legacy UX) — ตั้งจากพรีดีไฟน์
//   const mkRow = (name = "") => ({
//     rowId: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
//     Facilities_Name: name,
//     Start_Time: null,
//     End_Time: null,
//     Duration_Min: 15,
//     Room: "",
//     Technician: "",
//     Remark: "",
//     _linkedEventId: undefined,
//   });
//   const [facilities, setFacilities] = useState([]);
//   const [facilityRows, setFacilityRows] = useState(() => PREDEFINED.facilitiesTable.map(item => ({
//     ...mkRow(item.Facilities_Name),
//     Facilities_Name: item.Facilities_Name,
//     Start_Time: item.Start_Time,
//     End_Time: item.End_Time,
//     Duration_Min: item.Duration_Min ?? 15,
//     Room: item.Room ?? "",
//     Technician: item.Technician ?? "",
//     Remark: item.Remark ?? "",
//   })));

//   // ✅ ใช้ระบุแถว/ฟิลด์ที่กำลังโฟกัส เพื่อให้การคลิก slot ในปฏิทินผูกค่าลง Start_Time ได้เหมือนเดิม
//   const [focusedCell, setFocusedCell] = useState(null);

//   // ไว้จำ OR preview ตอนลาก เพื่อเอามา log อีกครั้งตอน Confirm
//   const orPreviewRef = useRef(null);

//   // Events
//   const [eventsDoctor, setEventsDoctor] = useState([]); // non X-ray
//   const [eventsXray, setEventsXray] = useState([]);     // aggregated
//   const [eventsOR, setEventsOR] = useState([]);         // OR events (tentative/confirmed)

//   // Selection / focus
//   const [selectedDoctorEvent, setSelectedDoctorEvent] = useState(null);
//   const [selectedXrayEventId, setSelectedXrayEventId] = useState(null);
//   const [selectedOrEventId, setSelectedOrEventId] = useState(null);

//   // Committed highlights
//   const [committedDoctorId, setCommittedDoctorId] = useState(null);
//   const [committedXrayIds, setCommittedXrayIds] = useState(new Set());

//   // Confirmed (grey)
//   const [confirmedDoctorIds, setConfirmedDoctorIds] = useState(new Set());
//   const [confirmedXrayIds, setConfirmedXrayIds] = useState(new Set());

//   // OR draw mode (จากพรีดีไฟน์)
//   const [orDrawMode, setOrDrawMode] = useState(!!PREDEFINED.orDrawMode);

//   // Appointment/Booking Transaction
//   const [bookings, setBookings] = useState([]);

//   // Mini refs (ไม่ใช้โฟกัสออโต้แล้ว เพราะ input เป็นพรีเซ็ต)
//   const inputRefs = useRef(new Map());

//   /* ---- โหลด Facilities options (เพื่อโชว์ใน dropdown ที่ disabled) ---- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const opts = await fetchFacilitiesOptions();
//         setFacilities(opts);
//       } catch (e) {
//         console.error("Load facilities failed:", e);
//         setFacilities([]);
//       }
//     })();
//   }, []);

//   /* ---- Filter doctors (non X-ray only) ---- */
//   const filteredDoctorsNonXray = useMemo(() => {
//     const nonXray = doctors.filter(d => (d.doctorType || "").toLowerCase() !== "x-ray");
//     if (!selectedClinic) return nonXray;
//     return nonXray.filter(d => {
//       const clinics = String(d.concatClinic || "").split(",").map(s => s.trim()).filter(Boolean);
//       return clinics.includes(selectedClinic);
//     });
//   }, [doctors, selectedClinic]);

//   /* ---- Load doctors from Kissflow VIEW (เดิม) ---- */
//   useEffect(() => {
//     (async () => {
//       try {
//         if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
//         const kf = window.kf;

//         let page = 1;
//         const rows = [];

//         while (true) {
//           const url =
//             `/form/2/${ACCOUNT_ID}/${DATAFORM_ID}/view/${VIEW_ID}/list` +
//             `?apply_preference=true&page_number=${page}&page_size=${PAGE_SIZE}` +
//             `&_application_id=${encodeURIComponent(APP_ID)}`;

//           const res = await kf.api(url, { method: "GET" });
//           const batch = Array.isArray(res?.Data) ? res.Data : [];

//           rows.push(...batch);

//           if (batch.length < PAGE_SIZE) break;
//           page += 1;
//         }

//         // Aggregate rows by Form_ID
//         const byId = new Map();
//         for (const r of rows) {
//           const id = r.Form_ID || r._id || r.id;
//           if (!id) continue;

//           if (!byId.has(id)) {
//             byId.set(id, {
//               _id: id,
//               name: r.Doctor_Name || "",
//               code: String(r.Doctor_Code || ""),
//               clinics: new Set(),
//               doctorType: (r.Doctor_Type || "general").toLowerCase(),
//             });
//           }

//           const entry = byId.get(id);
//           if (!entry.name && r.Doctor_Name) entry.name = r.Doctor_Name;
//           if (!entry.code && r.Doctor_Code) entry.code = String(r.Doctor_Code);

//           splitClinics(r.Concat_Clinic).forEach((c) => entry.clinics.add(c));
//           if (r.Clinic) entry.clinics.add(String(r.Clinic));
//           if (r.Doctor_Type && !entry._typeLocked) {
//             entry.doctorType = String(r.Doctor_Type).toLowerCase();
//             entry._typeLocked = true;
//           }
//         }

//         const list = Array.from(byId.values()).map((x) => ({
//           _id: x._id,
//           name: x.name,
//           code: x.code,
//           concatClinic: Array.from(x.clinics).join(","),
//           doctorType: x.doctorType || "general",
//         }));

//         setDoctors(list);

//         // Build clinic filter options from merged concatClinic
//         const clinicSet = new Set();
//         list.forEach((d) => splitClinics(d.concatClinic).forEach((c) => clinicSet.add(c)));
//         const opts = Array.from(clinicSet).map((c) => ({ value: c, label: c }));
//         setClinicOptions(opts);

//         // ตั้งค่า clinic ตาม PREDEFINED (ถ้าไม่มีในลิสต์ให้ fallback)
//         if (PREDEFINED.filters.clinic) {
//           const has = opts.some(o => o.value === PREDEFINED.filters.clinic);
//           setSelectedClinic(has ? PREDEFINED.filters.clinic : (opts[0]?.value ?? null));
//         } else {
//           setSelectedClinic(opts[0]?.value ?? null);
//         }

//       } catch (e) {
//         console.error("Load doctors from KF view failed:", e);
//         setDoctors([]);
//         setClinicOptions([]);
//       }
//     })();
//   }, []);

//   // Map doctorCodes -> _id แล้วตั้ง selectedDoctorIds อัตโนมัติจาก PREDEFINED
//   useEffect(() => {
//     if (!doctors.length) return;
//     if (!Array.isArray(PREDEFINED.filters.doctorCodes) || PREDEFINED.filters.doctorCodes.length === 0) {
//       setSelectedDoctorIds([]);
//       return;
//     }
//     const want = new Set(PREDEFINED.filters.doctorCodes.map(String));
//     const ids = doctors.filter(d => want.has(String(d.code))).map(d => d._id);
//     setSelectedDoctorIds(ids);
//   }, [doctors]);

//   async function fetchDocDetailsMapByIds(ids, { concurrency = 5 } = {}) {
//     if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
//     const kf = window.kf;

//     const results = {};
//     let i = 0;

//     async function fetchOne(id) {
//       const url =
//         `/form/2/${ACCOUNT_ID}/${FORM_SLUG}/view/${DETAIL_VIEW_SLUG}/${encodeURIComponent(id)}` +
//         `?_application_id=${encodeURIComponent(APP_ID)}`;
//       const res = await kf.api(url, { method: "GET" });
//       results[id] = res;
//     }

//     const pool = new Array(Math.min(concurrency, ids.length)).fill(0).map(async () => {
//       while (i < ids.length) {
//         const idx = i++;
//         const id = ids[idx];
//         try { await fetchOne(id); }
//         catch (e) {
//           console.error("Fetch doc detail failed for", id, e);
//           results[id] = {
//             Doctor_Name: "",
//             Doctor_Code: id,
//             Doctor_Type: "general",
//             "Table::Weekly_Slot": [],
//             "Table::Off_Day_Schedule_1": [],
//           };
//         }
//       }
//     });

//     await Promise.all(pool);
//     return results;
//   }

//   useEffect(() => {
//     (async () => {
//       if (!doctors.length) return;
//       const ids = doctors.map(d => d._id).filter(Boolean);
//       try {
//         const map = await fetchDocDetailsMapByIds(ids, { concurrency: 6 });
//         setDocDetailsMap(map);
//       } catch (e) {
//         console.error("Load doc detail map failed:", e);
//         setDocDetailsMap({});
//       }
//     })();
//   }, [doctors]);

//   async function fetchAppointmentsList({ pageSize = APPT_PAGE_SIZE } = {}) {
//     if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
//     const kf = window.kf;

//     const all = [];
//     let page = 1;

//     while (true) {
//       const url =
//         `/form/2/${ACCOUNT_ID}/${APPT_FORM_SLUG}/view/${APPT_VIEW_SLUG}/list` +
//         `?apply_preference=true&page_number=${page}&page_size=${pageSize}` +
//         `&_application_id=${encodeURIComponent(APP_ID)}`;

//       const res = await kf.api(url, { method: "GET" });
//       const batch = Array.isArray(res?.Data) ? res.Data : [];
//       all.push(...batch);

//       if (batch.length < pageSize) break;
//       page += 1;
//     }

//     return all;
//   }

//   /* ---- Load bookings from Kissflow ---- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const list = await fetchAppointmentsList();
//         setBookings(list);
//       } catch (e) {
//         console.error("Load bookings failed:", e);
//         setBookings([]);
//       }
//     })();
//   }, []);

//   async function fetchFacilitiesOptions({ pageSize = FAC_PAGE_SIZE } = {}) {
//     if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
//     const kf = window.kf;

//     const all = [];
//     let page = 1;

//     while (true) {
//       const url =
//         `/form/2/${ACCOUNT_ID}/${FAC_FORM_SLUG}/view/${FAC_VIEW_SLUG}/list` +
//         `?apply_preference=true&page_number=${page}&page_size=${pageSize}` +
//         `&_application_id=${encodeURIComponent(APP_ID)}`;

//       const res = await kf.api(url, { method: "GET" });
//       const batch = Array.isArray(res?.Data) ? res.Data : [];
//       all.push(...batch);

//       if (batch.length < pageSize) break;
//       page += 1;
//     }

//     const options = facilitiesToOptions(all);
//     return options;
//   }

//   async function fetchFacilityIndex({ pageSize = 500 } = {}) {
//     if (!window.kf) throw new Error("window.kf not found");
//     const kf = window.kf;
//     const all = [];
//     let page = 1;
//     while (true) {
//       const url =
//         `/form/2/${ACCOUNT_ID}/Facilities_Slot_Master_A00/view/Facilities_Slot_Master_Table_A00/list` +
//         `?apply_preference=true&page_number=${page}&page_size=${pageSize}` +
//         `&_application_id=${encodeURIComponent(APP_ID)}`;
//       const res = await kf.api(url, { method: "GET" });
//       const batch = Array.isArray(res?.Data) ? res.Data : [];
//       all.push(...batch);
//       if (batch.length < pageSize) break;
//       page++;
//     }
//     return all;
//   }

//   async function fetchFacilityDetail(formId) {
//     if (!window.kf) throw new Error("window.kf not found");
//     const kf = window.kf;
//     const url =
//       `/form/2/${ACCOUNT_ID}/Facilities_Slot_Master_A00/view/Facilities_Slot_Master_Table_A00/${encodeURIComponent(formId)}` +
//       `?_application_id=${encodeURIComponent(APP_ID)}`;
//     const res = await kf.api(url, { method: "GET" });
//     return res;
//   }

//   // === Time math: gcd/lcm ===
//   function gcd(a, b) { while (b) { const t = b; b = a % b; a = t; } return a; }
//   function lcm(a, b) { if (!a || !b) return a || b || 15; return (a * b) / gcd(a, b); }

//   function splitIntoBuckets(start, end, minutes) {
//     const out = [];
//     let t = new Date(start);
//     while (t < end) {
//       const nxt = addMin(t, minutes);
//       if (nxt > end) break;
//       out.push({ start: new Date(t), end: new Date(nxt) });
//       t = nxt;
//     }
//     return out;
//   }

//   function subtractOffRanges(s, e, offRanges) {
//     for (const r of (offRanges || [])) {
//       if (overlaps(s, e, r.start, r.end)) return null;
//     }
//     return { start: s, end: e };
//   }

//   function countDutyInBucket(bucketStart, bucketEnd, openRanges) {
//     let count = 0;
//     for (const r of openRanges) {
//       if (r.start <= bucketStart && r.end >= bucketEnd) {
//         count += (r.capacityPerSlot || 1);
//       }
//     }
//     return count;
//   }

//   function buildFacilityOpenRanges(detail, viewStart, viewEnd) {
//     const weekly = Array.isArray(detail?.["Table::Weekly_Slot"]) ? detail["Table::Weekly_Slot"] : [];
//     const offRaw = Array.isArray(detail?.["Table::Day_Off_Schedule"]) ? detail["Table::Day_Off_Schedule"] : [];

//     const offRanges = offRaw
//       .map(od => ({ start: parseAPIOffsetDate(od.Start_Date), end: parseAPIOffsetDate(od.End_Date) }))
//       .filter(r => r.start && r.end && r.start < r.end);

//     const out = [];

//     weekly.forEach(slot => {
//       const dow = slot?.Day_of_Week;
//       if (!dow || !DOW_MAP[dow]) return;
//       const [sH, sM] = String(slot.Start_Time || "08:00").split(":").map(n => parseInt(n, 10) || 0);
//       const [eH, eM] = String(slot.End_Time || "17:00").split(":").map(n => parseInt(n, 10) || 0);
//       const effFrom = slot?.Effective_Date_From ? parseDateYMD(slot.Effective_Date_From) : viewStart;
//       const effTo = slot?.Effective_Date_To ? parseDateYMD(slot.Effective_Date_To) : viewEnd;

//       const dt0 = firstOccurrenceOnOrAfter(effFrom, DOW_MAP[dow].idx);
//       const rule = new RRule({ freq: RRule.WEEKLY, interval: 1, byweekday: [DOW_MAP[dow].rrule], dtstart: dt0, until: effTo });
//       const dates = rule.between(viewStart, viewEnd, true);

//       dates.forEach(d => {
//         const s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), sH, sM);
//         const e = new Date(d.getFullYear(), d.getMonth(), d.getDate(), eH, eM);
//         const kept = subtractOffRanges(s, e, offRanges);
//         if (!kept) return;
//         out.push({
//           start: kept.start,
//           end: kept.end,
//           slotMinute: Number(slot.Slot_Minute || 30),
//           capacityPerSlot: Number(slot.Capacity_Per_Slot || 1),
//         });
//       });
//     });

//     return out;
//   }

//   function buildXrayDoctorOpenRanges(docDetailsMap, viewStart, viewEnd) {
//     const out = [];
//     for (const id of Object.keys(docDetailsMap || {})) {
//       const d = docDetailsMap[id];
//       const doctorTypeDefault = (d?.Doctor_Type || "").toLowerCase();
//       const weekly = Array.isArray(d?.["Table::Weekly_Slot"]) ? d["Table::Weekly_Slot"] : [];
//       const offRaw = Array.isArray(d?.["Table::Off_Day_Schedule_1"]) ? d["Table::Off_Day_Schedule_1"] : [];
//       const offRanges = offRaw
//         .map(od => ({ start: parseAPIOffsetDate(od.Start_Date), end: parseAPIOffsetDate(od.End_Date) }))
//         .filter(r => r.start && r.end && r.start < r.end);

//       weekly.forEach(slot => {
//         const type = String(slot?.Doctor_Type || doctorTypeDefault).toLowerCase();
//         if (type !== "x-ray") return;

//         const dow = slot?.Day_of_Week;
//         if (!dow || !DOW_MAP[dow]) return;
//         const [sH, sM] = String(slot.Start_Time || "08:00").split(":").map(n => parseInt(n, 10) || 0);
//         const [eH, eM] = String(slot.End_Time || "17:00").split(":").map(n => parseInt(n, 10) || 0);

//         const effFrom = slot?.Effective_From ? parseDateYMD(slot.Effective_From) : viewStart;
//         const effTo = slot?.Effective_Till ? parseDateYMD(slot.Effective_Till) : viewEnd;

//         const dt0 = firstOccurrenceOnOrAfter(effFrom, DOW_MAP[dow].idx);
//         const rule = new RRule({ freq: RRule.WEEKLY, interval: 1, byweekday: [DOW_MAP[dow].rrule], dtstart: dt0, until: effTo });
//         const dates = rule.between(viewStart, viewEnd, true);

//         dates.forEach(d0 => {
//           const s = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), sH, sM);
//           const e = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), eH, eM);
//           const kept = subtractOffRanges(s, e, offRanges);
//           if (!kept) return;
//           out.push({
//             start: kept.start,
//             end: kept.end,
//             slotMinute: Number(slot.Slot_Duration || 15),
//             capacityPerSlot: 1,
//             doctor_code: d?.Doctor_Code || id,
//             doctor_name: d?.Doctor_Name || "",
//           });
//         });
//       });
//     }
//     return out;
//   }

//   function buildFacilityFreeEvents({ facilityDetail, doctorOpenRanges, viewStart, viewEnd }) {
//     const facName = facilityDetail?.Facilities_Name || "";
//     const facRequireDoctor = !!facilityDetail?.Require_Doctor;

//     const facRanges = buildFacilityOpenRanges(facilityDetail, viewStart, viewEnd);
//     if (!facRanges.length) return [];

//     const sampleFacSlot = facRanges.find(Boolean)?.slotMinute || 30;
//     const sampleDocSlot = doctorOpenRanges.find(Boolean)?.slotMinute || sampleFacSlot;
//     const base = lcm(sampleFacSlot, sampleDocSlot);

//     const out = [];

//     facRanges.forEach(fr => {
//       const buckets = splitIntoBuckets(fr.start, fr.end, base);

//       buckets.forEach(({ start, end }) => {
//         const facUnits = countDutyInBucket(start, end, facRanges);
//         if (facUnits <= 0) return;

//         let docUnits = 0;
//         if (facRequireDoctor) {
//           docUnits = countDutyInBucket(start, end, doctorOpenRanges);
//           if (docUnits <= 0) return;
//         } else {
//           docUnits = Infinity;
//         }

//         const freeCount = Math.min(facUnits, docUnits);
//         if (freeCount > 0) {
//           out.push({
//             id: `FAC_${facName}_${toLocalIsoNoMillis(start)}`,
//             title: `ว่าง ${freeCount} คิว`,
//             start, end,
//             resource: { facility: facName, free_count: freeCount },
//             aggregated: true,
//           });
//         }
//       });
//     });

//     return out;
//   }

//   /* ---- Build schedules & bookings (จาก API เดิม + อิงตัวเลือกจาก PREDEFINED) ---- */
//   useEffect(() => {
//     (async () => {
//       const viewStart = new Date(2025, 8, 1);
//       const viewEnd = addDays(viewStart, 90);

//       const bookingIndex = new Map();
//       for (const b of bookings) {
//         const doctorCode = String(b.Doctor_Code || "").trim();
//         const start = parseAPIOffsetDate(b.Appointment_Date_Start);
//         const end = parseAPIOffsetDate(b.Appointment_Date_End);
//         if (!doctorCode || !start || !end || end <= start) continue;
//         const key = bookingKey(doctorCode, start);
//         if (!bookingIndex.has(key)) bookingIndex.set(key, [b]);
//         else bookingIndex.get(key).push(b);
//       }

//       const allDoctor = [];
//       const allXray = [];

//       for (const d of doctors) {
//         const id = d._id;
//         const docData = docDetailsMap[id];
//         if (!docData) continue;

//         const doctorName = docData?.Doctor_Name ?? "(Unknown)";
//         const doctorCode = docData?.Doctor_Code ?? id;
//         const weekly = Array.isArray(docData?.["Table::Weekly_Slot"]) ? docData["Table::Weekly_Slot"] : [];
//         const offRaw = Array.isArray(docData?.["Table::Off_Day_Schedule_1"]) ? docData["Table::Off_Day_Schedule_1"] : [];
//         const offRanges = offRaw
//           .map(od => ({ start: parseAPIOffsetDate(od.Start_Date), end: parseAPIOffsetDate(od.End_Date), clinic: od.Clinic_Off_Day || null }))
//           .filter(r => r.start && r.end && r.start < r.end);

//         const doctorTypeDefault = (docData?.Doctor_Type || d.doctorType || "").toLowerCase();

//         for (const slot of weekly) {
//           const day = slot?.Day_of_Week;
//           if (!day || !DOW_MAP[day]) continue;

//           const clinic = slot?.Clinic_Weekly_Schedule ?? "";
//           const patientType = slot?.Patient_Type ?? "Any";
//           const slotMin = Number(slot?.Slot_Duration ?? 15);
//           const effFrom = slot?.Effective_From ? parseDateYMD(slot.Effective_From) : viewStart;
//           const effTill = slot?.Effective_Till ? parseDateYMD(slot.Effective_Till) : viewEnd;
//           const [sH, sM] = String(slot?.Start_Time ?? "09:00").split(":").map(n => parseInt(n, 10) || 0);
//           const [eH, eM] = String(slot?.End_Time ?? "12:00").split(":").map(n => parseInt(n, 10) || 0);

//           const doctorType = (slot?.Doctor_Type ?? doctorTypeDefault ?? "").toLowerCase();
//           const facilityName = slot?.Facilities_Name ?? slot?.Facility_Name ?? docData?.Facilities_Name ?? docData?.Facility_Name ?? "";

//           const firstDay = firstOccurrenceOnOrAfter(effFrom, DOW_MAP[day].idx);
//           const dtstart = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate(), sH, sM, 0, 0);

//           const rule = new RRule({
//             freq: RRule.WEEKLY, interval: 1, byweekday: [DOW_MAP[day].rrule], dtstart, until: effTill,
//           });

//           const occurDates = rule.between(viewStart, viewEnd, true);

//           occurDates.forEach((dateOcc) => {
//             const resource = {
//               doctor: doctorName, doctor_code: doctorCode,
//               clinic, type: patientType, doctor_type: doctorType, facility: facilityName,
//             };
//             let evs = generateSlotsForDay(dateOcc, sH, sM, eH, eM, slotMin, `${doctorName} (${day})`, resource);

//             // ตัดวันหยุด
//             evs = evs.filter(ev => !offRanges.some(r => {
//               if (r.clinic && String(r.clinic) !== String(clinic)) return false;
//               return overlaps(ev.start, ev.end, r.start, r.end);
//             }));

//             // Mark booked (เฉพาะ doctor)
//             evs = evs.map(ev => {
//               const k = bookingKey(doctorCode, ev.start);
//               const arr = bookingIndex.get(k);
//               if (arr && arr.length) {
//                 const primary = arr[0];
//                 const itemIds = arr.map(x => x.Item_ID || x._id).filter(Boolean);
//                 const formattedTitle = buildBookedEventTitle(ev, primary);
//                 const title = arr.length > 1
//                   ? `${formattedTitle}\n(+${arr.length - 1} รายการ)`
//                   : formattedTitle;
//                 return { ...ev, booked: true, item_ids: itemIds, booked_count: arr.length, title };
//               }
//               return ev;
//             });

//             if (doctorType === "x-ray") allXray.push(...evs);
//             else if (selectedDoctorIds.includes(id)) allDoctor.push(...evs); // ใช้ตัวเลือกจาก PREDEFINED (map แล้ว)
//           });
//         }
//       }

//       setEventsDoctor(allDoctor);

//       // 2) doctor(X-ray) open ranges
//       const xrayDoctorOpenRanges = buildXrayDoctorOpenRanges(docDetailsMap, viewStart, viewEnd);

//       // 3) facility free slots รวม
//       let facilityIndex = [];
//       let facilityEvents = [];
//       try {
//         facilityIndex = await fetchFacilityIndex();
//         for (const row of facilityIndex) {
//           const formId = row.Form_ID || row._id || row.Item_ID;
//           if (!formId) continue;
//           const detail = await fetchFacilityDetail(formId);
//           const evs = buildFacilityFreeEvents({
//             facilityDetail: detail,
//             doctorOpenRanges: xrayDoctorOpenRanges,
//             viewStart,
//             viewEnd
//           });
//           facilityEvents.push(...evs);
//         }
//       } catch (e) {
//         console.error("Load facility free slots failed:", e);
//       }

//       setEventsXray(facilityEvents);
//     })();
//   }, [doctors, selectedDoctorIds, docDetailsMap, bookings, selectedClinic]);

//   /* ===== Unified calendar handlers ===== */
//   const detectKind = (event) => {
//     if (event._kind) return event._kind;
//     if (event?.resource?.status) return "or";
//     if ((event?.resource?.doctor_type || "").toLowerCase() === "x-ray" || event?.aggregated) return "facility";
//     return "doctor";
//   };

//   const onSelectUnifiedEvent = (event) => {
//     const kind = detectKind(event);
//     if (kind === "doctor") {
//       if (event.booked) return;
//       setSelectedDoctorEvent(prev => (prev && prev.id === event.id ? null : event));
//       setCommittedDoctorId(prev => (prev === event.id ? null : event.id));
//       return;
//     }
//     if (kind === "facility") {
//       if (event.booked) return;
//       setSelectedXrayEventId(prev => (prev === event.id ? null : event.id));

//       const slotFacility = event?.resource?.facility || "";
//       const ns = toLocalIsoNoMillis(event.start);
//       const ne = toLocalIsoNoMillis(event.end);
//       const dur = minutesBetween(event.start, event.end);

//       setFacilityRows(prev => {
//         if (!prev.length) return prev; // "Add" ปิดอยู่ ถ้าไม่มีแถวก็ไม่ทำอะไร
//         const idx = focusedCell ? prev.findIndex(r => r.rowId === focusedCell.rowId) : 0; // ถ้าไม่ได้โฟกัส ใช้แถวแรก
//         if (idx === -1) return prev;
//         const prevLinkedId = prev[idx]._linkedEventId || null;
//         const rows = [...prev];
//         rows[idx] = {
//           ...rows[idx],
//           Facilities_Name: rows[idx].Facilities_Name || slotFacility,
//           Start_Time: ns,
//           End_Time: ne,
//           Duration_Min: dur,
//           _linkedEventId: event.id,
//         };
//         setCommittedXrayIds(s => { const t = new Set(s); if (prevLinkedId) t.delete(prevLinkedId); t.add(event.id); return t; });
//         return rows;
//       });
//       setFocusedCell(null);
//       return;
//     }
//     if (kind === "or") {
//       if (event?.resource?.status === "Tentative") {
//         setSelectedOrEventId(prev => prev === event.id ? null : event.id);
//       }
//       return;
//     }
//   };

//   const onSelectSlotUnified = ({ start, end, action }) => {
//     if (!orDrawMode) return; // ค่าเริ่มจาก PREDEFINED
//     if (action !== "select") return;

//     const id = `OR_T_${Date.now()}`;
//     const blockStart = addMin(start, -OR_DEFAULT_SETUP_MIN);
//     const blockEnd = addMin(end, OR_DEFAULT_CLEANUP_MIN);

//     const newEv = { id, title: `Tentative • OR`, start, end, resource: { or: "", status: "Tentative" }, blockStart, blockEnd };
//     setEventsOR(prev => [...prev, newEv]);
//     setSelectedOrEventId(id);

//     orPreviewRef.current = {
//       Procedure_Start: toLocalIsoNoMillis(start),
//       Procedure_End: toLocalIsoNoMillis(end),
//       Setup_Buffer_Min: OR_DEFAULT_SETUP_MIN,
//       Cleanup_Buffer_Min: OR_DEFAULT_CLEANUP_MIN,
//       Resource_Locks: [{ Type: "OR", Key: "", Start: toLocalIsoNoMillis(blockStart), End: toLocalIsoNoMillis(blockEnd) }],
//       Status: "Tentative",
//     };
//   };

//   const eventPropGetterUnified = (event) => {
//     const kind = detectKind(event);

//     if (kind === "doctor" && confirmedDoctorIds.has(event.id))
//       return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };
//     if (kind === "facility" && confirmedXrayIds.has(event.id))
//       return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };
//     if (kind === "or" && event?.resource?.status === "Confirmed")
//       return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };

//     if (kind === "doctor" && event.booked)
//       return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };

//     let style = { border: 0 };
//     if (kind === "doctor") style = { ...style, backgroundColor: "#3b82f6", color: "#fff" };
//     if (kind === "facility") {
//       const fac = event?.resource?.facility || "";
//       style = { ...style, backgroundColor: facilityColor(fac), color: facilityTextColor() };
//     }
//     if (kind === "or") {
//       style = { ...style, backgroundColor: event?.resource?.status === "Tentative" ? "#a78bfa" : "#6b7280", color: "#fff" };
//       if (selectedOrEventId === event.id && event?.resource?.status === "Tentative") {
//         style.outline = "2px solid #dc2626";
//       }
//       return { style };
//     }

//     const selected = (kind === "doctor" && selectedDoctorEvent?.id === event.id);
//     const committed = (kind === "doctor" && committedDoctorId === event.id);
//     if (selected) style = { ...style, outline: "2px solid #1d4ed8", boxShadow: "0 0 0 2px #1d4ed8 inset" };
//     if (committed) style = { ...style, outline: "2px solid #16a34a", boxShadow: "0 0 0 2px #16a34a inset" };

//     return { style };
//   };

//   const unifiedEvents = useMemo(() => {
//     const tag = (ev, kind) => ({ ...ev, _kind: kind });
//     return [
//       ...eventsDoctor.map(e => tag(e, "doctor")),
//       ...eventsXray.map(e => tag(e, "facility")),
//       ...eventsOR.map(e => tag(e, "or")),
//     ];
//   }, [eventsDoctor, eventsXray, eventsOR]);

//   /* =========================
//   * Render
//   * ========================= */
//   return (
//     <div style={{ height: "100%", minHeight: 560, padding: 0 }}>
//       {/* Filters + OR tools (ทั้งหมดดึงจาก PREDEFINED และปิดแก้ไข) */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "end", marginBottom: 12 }}>
//         <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//           <div>
//             <label style={{ display: "block", marginBottom: 6 }}>เลือกคลินิก :</label>
//             <Select
//               allowClear style={{ width: 320 }}
//               value={selectedClinic ?? undefined}
//               onChange={() => { /* disabled */ }}
//               options={clinicOptions}
//               showSearch optionFilterProp="label" placeholder="เลือกคลินิก…"
//               disabled
//             />
//           </div>
//           <div>
//             <label style={{ display: "block", marginBottom: 6 }}>เลือกแพทย์ :</label>
//             <Select
//               mode="multiple"
//               style={{ width: 520 }}
//               value={selectedDoctorIds}
//               onChange={() => { /* disabled */ }}
//               options={filteredDoctorsNonXray.map(d => ({ value: d._id, label: `${d.name} — (${d.code || d._id})` }))}
//               showSearch
//               optionFilterProp="label"
//               placeholder="เลือกแพทย์…"
//               disabled
//             />
//           </div>
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <span>ลากเพื่อสร้าง OR:</span>
//           <Switch checked={orDrawMode} onChange={() => { /* disabled */ }} disabled />
//           <Button disabled={!selectedOrEventId} danger onClick={() => { /* disabled */ }} disabled>ลบ OR (Tentative)</Button>
//         </div>

//         <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
//           <Button type="primary" onClick={() => { /* คุณยังสามารถเชื่อมต่อ handleConfirm ได้ถ้าต้องการส่งต่อ */ }}>Confirm</Button>
//           <Button onClick={() => { /* คุณยังสามารถเชื่อมต่อ handleReset ได้*/ }}>Reset</Button>
//         </div>
//       </div>

//       {/* Facilities Usage (legacy) — แสดงค่าจาก PREDEFINED และปิดแก้ไข */}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
//         <div style={{ fontWeight: 600 }}>Facilities Usage</div>
//         <button
//           style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #999", background: "#f3f4f6", color: "#6b7280", cursor: "not-allowed" }}
//           disabled
//         >
//           + เพิ่ม Facility
//         </button>
//       </div>

//       {facilityRows.map((r) => (
//         <div key={r.rowId}
//           style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1.4fr 0.8fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
//           <Select value={r.Facilities_Name || undefined} options={facilities} placeholder="เลือก Facilities_Name" showSearch optionFilterProp="label" disabled />
//           <Input
//             value={r.Start_Time || ""}
//             onFocus={() => setFocusedCell({ rowId: r.rowId, field: "Start_Time" })}
//             onChange={(e) => setFacilityRows(rows => rows.map(x => x.rowId === r.rowId ? { ...x, Start_Time: e.target.value } : x))}
//           />
//           <Input value={r.End_Time || ""} readOnly />
//           <Input value={r.Duration_Min} readOnly />
//           <Input value={r.Room} readOnly />
//           <Input value={r.Technician} readOnly />
//           <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
//             <button style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #ddd", background: "#f3f4f6", color: "#6b7280", cursor: "not-allowed" }} disabled>
//               ลบ
//             </button>
//           </div>
//         </div>
//       ))}

//       {/* ปฏิทินรวม (ยังดึงจาก API เดิม) */}
//       <Calendar
//         selectable={orDrawMode}
//         localizer={localizer}
//         events={unifiedEvents}
//         startAccessor="start"
//         endAccessor="end"
//         defaultView="week"
//         views={["day", "week", "month"]}
//         step={15}
//         min={new Date(2025, 0, 1, 6, 0)}
//         max={new Date(2025, 0, 1, 20, 0)}
//         onSelectEvent={onSelectUnifiedEvent}
//         onSelectSlot={onSelectSlotUnified}
//         eventPropGetter={eventPropGetterUnified}
//         style={{ height: 720, background: "#fff", marginTop: 8 }}
//       />
//     </div>
//   );
// }

// ----------------------------------------------------------------------------------------------------------------------


import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { RRule } from "rrule";
import {
    format, parse, startOfWeek, getDay,
    addDays, addMinutes
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import { th } from 'date-fns/locale';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Select, Input, Switch, Button, Modal, message } from "antd";

/* =========================
* Localizer
* ========================= */
const locales = { "th-TH": th };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

/* =========================
* OR Defaults
* ========================= */
const OR_DEFAULT_SETUP_MIN = 0;
const OR_DEFAULT_CLEANUP_MIN = 0;

/* =========================
* 🔧 PRE-DEFINED INPUT DATA (ตัวอย่าง)
* หมายเหตุ:
* - ค่าพวกนี้จะถูกใช้ตั้งต้นให้กับทุกอินพุต (dropdown/text) โดยไม่รอผู้ใช้
* - การแสดง slot ใน Calendar ยังดึงจาก API เดิมเหมือนเดิม แต่จะอิงตัวเลือกจากค่าพรีดีไฟน์นี้
* ========================= */
const PREDEFINED = {
    filters: {
        // ชื่อคลินิกต้องมีอยู่จริงในข้อมูลแพทย์ที่โหลดมา (ถ้าไม่พบ ระบบจะ fallback เป็นตัวแรกในลิสต์)
        clinic: null,
        // เลือกหมอด้วย "รหัสหมอ" (Doctor_Code) เพื่อ map -> _id หลังโหลดจาก API
        doctorCodes: [],
    },
    facilitiesTable: [
        {
            Facilities_Name: null,
            Start_Time: null,
            End_Time: null,
            Duration_Min: null,
            //   Room: "XR-101",
            //   Technician: "Tech A",
            //   Remark: "Walk-in",
        },
        // {
        //   Facilities_Name: "X-ray Room 2",
        //   Start_Time: "2025-10-10T09:15:00+07:00 Asia/Bangkok",
        //   End_Time:   "2025-10-10T09:30:00+07:00 Asia/Bangkok",
        //   Duration_Min: 15,
        // //   Room: "XR-102",
        // //   Technician: "Tech B",
        // //   Remark: "",
        // }
    ],
    // เปิด/ปิดโหมดลากสร้าง OR ตั้งต้น (แนะนำให้ปิด หากต้องการแสดงผลจากพรีดีไฟน์เฉยๆ)
    orDrawMode: false,
};

/* =========================
* Helpers
* ========================= */
const pad2 = (n) => String(n).padStart(2, "0");

function parseDateYMD(str) {
    if (!str) return null;
    const [y, m, d] = String(str).split("-").map(n => parseInt(n, 10));
    return new Date(y, (m || 1) - 1, d || 1);
}
function parseAPIOffsetDate(str) {
    if (!str) return null;
    const isoWithOffset = String(str).split(" Asia/")[0];
    const dt = new Date(isoWithOffset);
    return isNaN(dt) ? null : dt;
}
function toLocalIsoNoMillis(date) {
    const y = date.getFullYear();
    const M = pad2(date.getMonth() + 1);
    const d = pad2(date.getDate());
    const h = pad2(date.getHours());
    const m = pad2(date.getMinutes());
    return `${y}-${M}-${d}T${h}:${m}:00Z`;
}
// แปลง/ฟอร์แมตเวลาสำหรับ POST (ไม่ใส่ timezone)
function toLocalNoTZ(date) {
    const y = date.getFullYear();
    const M = pad2(date.getMonth() + 1);
    const d = pad2(date.getDate());
    const h = pad2(date.getHours());
    const m = pad2(date.getMinutes());
    return y + '-' + M + '-' + d + 'T' + h + ':' + m + ':00';
}
function looksNoTZ(s) { return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(s); }
function normalizeLocalNoTZ(v) {
    if (!v) return null;
    if (v instanceof Date) return toLocalNoTZ(v);
    const s = String(v).trim();
    if (looksNoTZ(s)) return s.length === 16 ? s + ':00' : s; // already no-TZ
    // มี Z / +hh:mm / Asia/Bangkok → parse แล้วคืนแบบไม่มี timezone
    if (/Z$|[+\-]\d{2}:\d{2}|Asia\//i.test(s)) {
        const d = parseAPIOffsetDate(s) || new Date(s);
        return isNaN(d) ? s : toLocalNoTZ(d);
    }
    const d = new Date(s);
    return isNaN(d) ? s : toLocalNoTZ(d);
}
function toDateSafe(v) {
    if (!v) return null;
    if (v instanceof Date) return v;
    const s = String(v);
    if (/Asia\//.test(s)) return parseAPIOffsetDate(s);
    const d = new Date(s);
    return isNaN(d) ? null : d;
}
function fmtDateDDMMYYYY(d) { return format(d, 'dd/MM/yyyy'); }
function fmtHHmm(d) { return format(d, 'HH:mm'); }

function minutesBetween(a, b) {
    return Math.max(1, Math.round((b.getTime() - a.getTime()) / 60000));
}
function overlaps(aStart, aEnd, bStart, bEnd) { return aStart < bEnd && bStart < aEnd; }
function addMin(dt, min) { return new Date(dt.getTime() + min * 60000); }

function generateSlotsForDay(date, startH, startM, endH, endM, slotMinutes, title, resource) {
    const slots = [];
    let start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startH, startM);
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endH, endM);
    while (start < end) {
        const slotEnd = addMinutes(start, slotMinutes);
        slots.push({
            id: `${resource.doctor_code || resource.facility || "res"}_${date.toDateString()}_${pad2(start.getHours())}:${pad2(start.getMinutes())}`,
            title,
            start: new Date(start),
            end: slotEnd,
            resource,
        });
        start = slotEnd;
    }
    return slots;
}
const DOW_MAP = {
    Sun: { rrule: RRule.SU, idx: 0 },
    Mon: { rrule: RRule.MO, idx: 1 },
    Tue: { rrule: RRule.TU, idx: 2 },
    Wed: { rrule: RRule.WE, idx: 3 },
    Thu: { rrule: RRule.TH, idx: 4 },
    Fri: { rrule: RRule.FR, idx: 5 },
    Sat: { rrule: RRule.SA, idx: 6 },
};
function firstOccurrenceOnOrAfter(effFromDate, dowIdx) {
    const d = new Date(effFromDate);
    const delta = (dowIdx - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + delta);
    return d;
}
function bookingKey(doctorCode, startDate) {
    const y = startDate.getFullYear();
    const M = pad2(startDate.getMonth() + 1);
    const d = pad2(startDate.getDate());
    const h = pad2(startDate.getHours());
    const m = pad2(startDate.getMinutes());
    return `${doctorCode}__${y}-${M}-${d}T${h}:${m}:00`;
}

/** รวม “ว่าง N คิว” เฉพาะ X-ray โดยแยกตาม เวลา+Facility */
function aggregateFreeSlotsByTimeAndFacility(events) {
    const groups = new Map();
    const keep = [];
    for (const ev of events) {
        if (ev.booked) { keep.push(ev); continue; }
        const startKey = toLocalIsoNoMillis(ev.start);
        const facility = ev?.resource?.facility || "";
        const k = `${startKey}__${facility}`;
        if (!groups.has(k)) {
            groups.set(k, { start: ev.start, end: ev.end, list: [ev], facility });
        } else {
            const g = groups.get(k);
            g.list.push(ev);
            if (ev.end > g.end) g.end = ev.end;
        }
    }
    for (const [, g] of groups) {
        if (g.list.length === 1) {
            const ev = g.list[0];
            keep.push({ ...ev, title: `ว่าง 1 คิว` });
        } else {
            const sample = g.list[0];
            keep.push({
                id: `agg_${toLocalIsoNoMillis(g.start)}_${g.facility}`,
                title: `ว่าง ${g.list.length} คิว`,
                start: g.start,
                end: g.end,
                resource: { ...sample.resource, facility: g.facility },
                aggregated: true,
                free_count: g.list.length,
            });
        }
    }
    return keep;
}

// แปลงเวลาจากสตริง API ที่มี +07:00 Asia/Bangkok → เป็น Date
function parseAPITimeMaybe(s) {
    if (!s) return null;
    return parseAPIOffsetDate(s);
}

// ฟอร์แมตช่วงเวลา HH:mm - HH:mm
function fmtTimeRange(start, end) {
    if (!(start instanceof Date) || isNaN(start)) return "";
    if (!(end instanceof Date) || isNaN(end)) return format(start, "HH:mm");
    return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
}

// สกัดชื่อคนไข้
function getPatientNameFromBooking(b) {
    if (!b) return "";
    if (b.Patient_Name) return String(b.Patient_Name);
    const p = [b.Prefix_Name, b.First_Name, b.Last_Name].filter(Boolean).join(" ").trim();
    return p || "";
}

// สกัด Concat Facility + เวลา จาก booking
function getFacilityLineFromBooking(b) {
    if (!b) return "";
    const rows = Array.isArray(b["Table::Facility"]) ? b["Table::Facility"] : null;
    if (rows && rows.length) {
        return rows.map((r) => {
            const name = r.Facility_Name || r.Facilities_Name || "";
            const st = parseAPITimeMaybe(r.Start_Time_Facility || r.Start_Time);
            const et = parseAPITimeMaybe(r.End_Time_Facility || r.End_Time);
            const time = fmtTimeRange(st, et);
            if (!name && !time) return "";
            return `${name}${time ? ` : ${time}` : ""}`;
        }).filter(Boolean).join(" | ");
    }
    const name = b.Concat_Facility_Name || b.Facility_Name || b.Facilities_Name || "";
    const st = parseAPITimeMaybe(b.Start_Time_Facility || b.Start_Time_Facility_1);
    const et = parseAPITimeMaybe(b.End_Time_Facility || b.End_Time_Facility_1);
    const time = fmtTimeRange(st, et);
    if (!name && !time) return "";
    return `${name}${time ? ` : ${time}` : ""}`;
}

// ✅ ชื่อ title สำหรับ slot ที่ถูกจอง
function buildBookedEventTitle(ev, bookingDetail) {
    const patient = getPatientNameFromBooking(bookingDetail);
    const doctor = bookingDetail?.Doctor_Name || ev?.resource?.doctor || "";
    const facLine = getFacilityLineFromBooking(bookingDetail);
    return [patient, doctor, facLine].filter(Boolean).join("\n");
}

/* สีสำหรับ Facility */
function hashStr(s = "") { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function facilityColor(name = "") { if (!name) return "#06b6d4"; const h = hashStr(name) % 360; return `hsl(${h} 70% 48%)`; }
function facilityTextColor() { return "#fff"; }

/* ===== KF view config for All ===== */
const ACCOUNT_ID = "Ac7wE0VDRiSM";
const APP_ID = "Hospital_Information_Systems_HIS_A00";

/* ===== KF view config for doctors data ===== */
const DATAFORM_ID = "Weekly_Slot_Dataform_A00";
const VIEW_ID = "Add_Data_A05";
const PAGE_SIZE = 500;

const uniq = (arr) => Array.from(new Set(arr));
function splitClinics(str) {
    return String(str || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

/* ===== KF detail-view config (per doctor) ===== */
const FORM_SLUG = "Weekly_Slot_Dataform_A00";
const DETAIL_VIEW_SLUG = "View_Table_A00";

/* ===== Appointments view (bookings) ===== */
const APPT_FORM_SLUG = "Appointment_Transaction_A00";
const APPT_VIEW_SLUG = "Add_Data_A50";
const APPT_PAGE_SIZE = 500;

/* ===== Facilities view (options for the Facilities select) ===== */
const FAC_FORM_SLUG = "Facilities_Slot_Master_A00";
const FAC_VIEW_SLUG = "Add_Data_A51";
const FAC_PAGE_SIZE = 500;

function toStr(x) { return x == null ? "" : String(x).trim(); }
function normalizeFacilityRow(row) {
    const text = toStr(
        row.Facilities_Name ??
        row.Facility_Name ??
        row.Facility ??
        row.Name ??
        row.label ??
        row.value ??
        ""
    );
    return text ? { value: text, label: text } : null;
}
function uniqueOptions(options) {
    const map = new Map();
    for (const o of options) {
        if (!o || !o.value) continue;
        if (!map.has(o.value)) map.set(o.value, o);
    }
    return Array.from(map.values());
}
export function facilitiesToOptions(rows) {
    if (!Array.isArray(rows)) return [];
    return uniqueOptions(rows.map(normalizeFacilityRow).filter(Boolean));
}

/* =========================
* Map Impact Item -> PREDEFINED shape
* ========================= */
function mapImpactToPredef(doc) {
    try {
        const clinic = doc.Clinic || doc.Clinic_Name || null;
        const doctorCodes = doc.Doctor_Code ? [String(doc.Doctor_Code)] : [];

        const rows = [];
        const table1 = Array.isArray(doc["Table::Facility_1"]) ? doc["Table::Facility_1"] : [];

        if (table1.length) {
            for (const r of table1) {
                const name = r.Facility_Name || r.Facilities_Name || doc.Concat_Facility_Name || "";
                const st = r.Start_Time_Facility || r.Start_Time || "";
                const et = r.End_Time_Facility || r.End_Time || "";
                const d1 = parseAPIOffsetDate(st);
                const d2 = parseAPIOffsetDate(et);
                const dur = d1 && d2 && d2 > d1 ? minutesBetween(d1, d2) : 15;
                rows.push({
                    Facilities_Name: name,
                    Start_Time: st,
                    End_Time: et,
                    Duration_Min: dur,
                    Room: "",
                    Technician: "",
                    Remark: "",
                });
            }
        } else {
            const name = doc.Concat_Facility_Name || doc.Facility_Name || "";
            const st = doc.Start_Time_Facility_1 || doc.Start_Time_Facility || doc.Start_Time || "";
            const et = doc.End_Time_Facility_1 || doc.End_Time_Facility || doc.End_Time || "";
            const d1 = parseAPIOffsetDate(st);
            const d2 = parseAPIOffsetDate(et);
            const dur = d1 && d2 && d2 > d1 ? minutesBetween(d1, d2) : 15;
            if (name || st || et) {
                rows.push({
                    Facilities_Name: name,
                    Start_Time: st,
                    End_Time: et,
                    Duration_Min: dur,
                    Room: "",
                    Technician: "",
                    Remark: "",
                });
            }
        }

        return {
            filters: { clinic, doctorCodes },
            facilitiesTable: rows,
            orDrawMode: false,
        };
    } catch (e) {
        console.error("mapImpactToPredef error", e);
        return PREDEFINED;
    }
}

/* =========================
* Component
* ========================= */
export default function UnifiedCalendar_OR_WithLegacyFacility_Predefined() {
    // ⬇️ Dynamic PREDEFINED from Impact item (fallback = constant PREDEFINED)
    const [predef, setPredef] = useState(PREDEFINED);
    // Doctors/Clinics
    const [doctors, setDoctors] = useState([]);
    const [clinicOptions, setClinicOptions] = useState([]);
    const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);
    const [selectedClinic, setSelectedClinic] = useState(predef.filters.clinic ?? null);
    const [docDetailsMap, setDocDetailsMap] = useState({});

    // Facilities rows (legacy UX) — ตั้งจากพรีดีไฟน์
    const mkRow = (name = "") => ({
        rowId: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        Facilities_Name: name,
        Start_Time: null,
        End_Time: null,
        Duration_Min: 15,
        Room: "",
        Technician: "",
        Remark: "",
        _linkedEventId: undefined,
    });
    const [facilities, setFacilities] = useState([]);
    const [facilityRows, setFacilityRows] = useState(() => predef.facilitiesTable.map(item => ({
        ...mkRow(item.Facilities_Name),
        Facilities_Name: item.Facilities_Name,
        Start_Time: item.Start_Time,
        End_Time: item.End_Time,
        Duration_Min: item.Duration_Min ?? 15,
        Room: item.Room ?? "",
        Technician: item.Technician ?? "",
        Remark: item.Remark ?? "",
    })));

    // ✅ ใช้ระบุแถว/ฟิลด์ที่กำลังโฟกัส เพื่อให้การคลิก slot ในปฏิทินผูกค่าลง Start_Time ได้เหมือนเดิม
    const [focusedCell, setFocusedCell] = useState(null);

    // ไว้จำ OR preview ตอนลาก เพื่อเอามา log อีกครั้งตอน Confirm
    const orPreviewRef = useRef(null);

    // Events
    const [eventsDoctor, setEventsDoctor] = useState([]); // non X-ray
    const [eventsXray, setEventsXray] = useState([]);     // aggregated
    const [eventsOR, setEventsOR] = useState([]);         // OR events (tentative/confirmed)

    // Selection / focus
    const [selectedDoctorEvent, setSelectedDoctorEvent] = useState(null);
    const [selectedXrayEventId, setSelectedXrayEventId] = useState(null);
    const [selectedOrEventId, setSelectedOrEventId] = useState(null);

    // Committed highlights
    const [committedDoctorId, setCommittedDoctorId] = useState(null);
    const [committedXrayIds, setCommittedXrayIds] = useState(new Set());

    // Confirmed (grey)
    const [confirmedDoctorIds, setConfirmedDoctorIds] = useState(new Set());
    const [confirmedXrayIds, setConfirmedXrayIds] = useState(new Set());

    // OR draw mode (จากพรีดีไฟน์)
    const [orDrawMode, setOrDrawMode] = useState(!!predef.orDrawMode);

    // Appointment/Booking Transaction
    const [bookings, setBookings] = useState([]);

    // Mini refs (ไม่ใช้โฟกัสออโต้แล้ว เพราะ input เป็นพรีเซ็ต)
    const inputRefs = useRef(new Map());

    /* ---- โหลด Facilities options (เพื่อโชว์ใน dropdown ที่ disabled) ---- */
    useEffect(() => {
        (async () => {
            try {
                const opts = await fetchFacilitiesOptions();
                setFacilities(opts);
            } catch (e) {
                console.error("Load facilities failed:", e);
                setFacilities([]);
            }
        })();
    }, []);

    // ⬇️ เมื่อ predef เปลี่ยน (จาก Impact item) อัปเดตแถว Facilities และโหมด OR
    useEffect(() => {
        setFacilityRows(() => predef.facilitiesTable.map(item => ({
            ...mkRow(item.Facilities_Name),
            Facilities_Name: item.Facilities_Name,
            Start_Time: item.Start_Time,
            End_Time: item.End_Time,
            Duration_Min: item.Duration_Min ?? 15,
            Room: item.Room ?? "",
            Technician: item.Technician ?? "",
            Remark: item.Remark ?? "",
        })));
        setOrDrawMode(!!predef.orDrawMode);
    }, [predef]);

    // ⬇️ ดึง item id จาก app variable แล้วโหลด Impact item → map เป็น PREDEFINED
    useEffect(() => {
        (async () => {
            try {
                if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
                const kf = window.kf;
                const appVariable1 = await kf.app.getVariable("Appointment_Transaction_Instance_ID");
                let itemId = appVariable1;
                console.info("itemId = ", itemId)
                if (appVariable1 && typeof appVariable1 === 'object') {
                    itemId = appVariable1.value || appVariable1._id || appVariable1.id || appVariable1.Item_ID;
                }
                if (!itemId) {
                    console.warn("No item id from app variable 'variableId'");
                    return;
                }
                // ใช้ path แบบ relative ให้ทำงานใน Kissflow runtime (เทียบเท่า URL เต็มที่ให้มา)
                const url = `/form/2/${ACCOUNT_ID}/Appointment_Transaction_A00/view/Impact_List_A00/${encodeURIComponent(itemId)}?_application_id=${encodeURIComponent(APP_ID)}`;
                const doc = await kf.api(url, { method: "GET" });
                console.info("doc = ", doc)
                const mapped = mapImpactToPredef(doc);
                console.info("mapped = ", mapped)
                setPredef(mapped);
            } catch (e) {
                console.error("Fetch Impact item failed:", e);
            }
        })();
    }, []);

    // ⬇️ อัปเดตคลินิกที่เลือก เมื่อมีตัวเลือกคลินิก หรือพรีดีไฟน์เปลี่ยน
    useEffect(() => {
        if (!clinicOptions.length) return;
        const preferred = predef?.filters?.clinic ?? null;
        if (preferred) {
            const has = clinicOptions.some(o => o.value === preferred);
            setSelectedClinic(has ? preferred : (clinicOptions[0]?.value ?? null));
        } else {
            setSelectedClinic(clinicOptions[0]?.value ?? null);
        }
    }, [clinicOptions, predef]);

    /* ---- Filter doctors (non X-ray only) ---- */
    const filteredDoctorsNonXray = useMemo(() => {
        const nonXray = doctors.filter(d => (d.doctorType || "").toLowerCase() !== "x-ray");
        if (!selectedClinic) return nonXray;
        return nonXray.filter(d => {
            const clinics = String(d.concatClinic || "").split(",").map(s => s.trim()).filter(Boolean);
            return clinics.includes(selectedClinic);
        });
    }, [doctors, selectedClinic]);

    /* ---- Load doctors from Kissflow VIEW (เดิม) ---- */
    useEffect(() => {
        (async () => {
            try {
                if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
                const kf = window.kf;

                let page = 1;
                const rows = [];

                while (true) {
                    const url =
                        `/form/2/${ACCOUNT_ID}/${DATAFORM_ID}/view/${VIEW_ID}/list` +
                        `?apply_preference=true&page_number=${page}&page_size=${PAGE_SIZE}` +
                        `&_application_id=${encodeURIComponent(APP_ID)}`;

                    const res = await kf.api(url, { method: "GET" });
                    const batch = Array.isArray(res?.Data) ? res.Data : [];

                    rows.push(...batch);

                    if (batch.length < PAGE_SIZE) break;
                    page += 1;
                }

                // Aggregate rows by Form_ID
                const byId = new Map();
                for (const r of rows) {
                    const id = r.Form_ID || r._id || r.id;
                    if (!id) continue;

                    if (!byId.has(id)) {
                        byId.set(id, {
                            _id: id,
                            name: r.Doctor_Name || "",
                            code: String(r.Doctor_Code || ""),
                            clinics: new Set(),
                            doctorType: (r.Doctor_Type || "general").toLowerCase(),
                        });
                    }

                    const entry = byId.get(id);
                    if (!entry.name && r.Doctor_Name) entry.name = r.Doctor_Name;
                    if (!entry.code && r.Doctor_Code) entry.code = String(r.Doctor_Code);

                    splitClinics(r.Concat_Clinic).forEach((c) => entry.clinics.add(c));
                    if (r.Clinic) entry.clinics.add(String(r.Clinic));
                    if (r.Doctor_Type && !entry._typeLocked) {
                        entry.doctorType = String(r.Doctor_Type).toLowerCase();
                        entry._typeLocked = true;
                    }
                }

                const list = Array.from(byId.values()).map((x) => ({
                    _id: x._id,
                    name: x.name,
                    code: x.code,
                    concatClinic: Array.from(x.clinics).join(","),
                    doctorType: x.doctorType || "general",
                }));

                setDoctors(list);

                // Build clinic filter options from merged concatClinic
                const clinicSet = new Set();
                list.forEach((d) => splitClinics(d.concatClinic).forEach((c) => clinicSet.add(c)));
                const opts = Array.from(clinicSet).map((c) => ({ value: c, label: c }));
                setClinicOptions(opts);

                // ตั้งค่า clinic ตาม PREDEFINED (ถ้าไม่มีในลิสต์ให้ fallback)
                if (predef.filters.clinic) {
                    const has = opts.some(o => o.value === predef.filters.clinic);
                    setSelectedClinic(has ? predef.filters.clinic : (opts[0]?.value ?? null));
                } else {
                    setSelectedClinic(opts[0]?.value ?? null);
                }

            } catch (e) {
                console.error("Load doctors from KF view failed:", e);
                setDoctors([]);
                setClinicOptions([]);
            }
        })();
    }, []);

    // Map doctorCodes -> _id แล้วตั้ง selectedDoctorIds อัตโนมัติจาก PREDEFINED
    useEffect(() => {
        if (!doctors.length) return;
        if (!Array.isArray(predef.filters.doctorCodes) || predef.filters.doctorCodes.length === 0) {
            setSelectedDoctorIds([]);
            return;
        }
        const want = new Set(predef.filters.doctorCodes.map(String));
        const ids = doctors.filter(d => want.has(String(d.code))).map(d => d._id);
        setSelectedDoctorIds(ids);
    }, [doctors, predef]);

    async function fetchDocDetailsMapByIds(ids, { concurrency = 5 } = {}) {
        if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
        const kf = window.kf;

        const results = {};
        let i = 0;

        async function fetchOne(id) {
            const url =
                `/form/2/${ACCOUNT_ID}/${FORM_SLUG}/view/${DETAIL_VIEW_SLUG}/${encodeURIComponent(id)}` +
                `?_application_id=${encodeURIComponent(APP_ID)}`;
            const res = await kf.api(url, { method: "GET" });
            results[id] = res;
        }

        const pool = new Array(Math.min(concurrency, ids.length)).fill(0).map(async () => {
            while (i < ids.length) {
                const idx = i++;
                const id = ids[idx];
                try { await fetchOne(id); }
                catch (e) {
                    console.error("Fetch doc detail failed for", id, e);
                    results[id] = {
                        Doctor_Name: "",
                        Doctor_Code: id,
                        Doctor_Type: "general",
                        "Table::Weekly_Slot": [],
                        "Table::Off_Day_Schedule_1": [],
                    };
                }
            }
        });

        await Promise.all(pool);
        return results;
    }

    useEffect(() => {
        (async () => {
            if (!doctors.length) return;
            const ids = doctors.map(d => d._id).filter(Boolean);
            try {
                const map = await fetchDocDetailsMapByIds(ids, { concurrency: 6 });
                setDocDetailsMap(map);
            } catch (e) {
                console.error("Load doc detail map failed:", e);
                setDocDetailsMap({});
            }
        })();
    }, [doctors]);

    async function fetchAppointmentsList({ pageSize = APPT_PAGE_SIZE } = {}) {
        if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
        const kf = window.kf;

        const all = [];
        let page = 1;

        while (true) {
            const url =
                `/form/2/${ACCOUNT_ID}/${APPT_FORM_SLUG}/view/${APPT_VIEW_SLUG}/list` +
                `?apply_preference=true&page_number=${page}&page_size=${pageSize}` +
                `&_application_id=${encodeURIComponent(APP_ID)}`;

            const res = await kf.api(url, { method: "GET" });
            const batch = Array.isArray(res?.Data) ? res.Data : [];
            all.push(...batch);

            if (batch.length < pageSize) break;
            page += 1;
        }

        return all;
    }

    /* ---- Load bookings from Kissflow ---- */
    useEffect(() => {
        (async () => {
            try {
                const list = await fetchAppointmentsList();
                setBookings(list);
            } catch (e) {
                console.error("Load bookings failed:", e);
                setBookings([]);
            }
        })();
    }, []);

    async function fetchFacilitiesOptions({ pageSize = FAC_PAGE_SIZE } = {}) {
        if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
        const kf = window.kf;

        const all = [];
        let page = 1;

        while (true) {
            const url =
                `/form/2/${ACCOUNT_ID}/${FAC_FORM_SLUG}/view/${FAC_VIEW_SLUG}/list` +
                `?apply_preference=true&page_number=${page}&page_size=${pageSize}` +
                `&_application_id=${encodeURIComponent(APP_ID)}`;

            const res = await kf.api(url, { method: "GET" });
            const batch = Array.isArray(res?.Data) ? res.Data : [];
            all.push(...batch);

            if (batch.length < pageSize) break;
            page += 1;
        }

        const options = facilitiesToOptions(all);
        return options;
    }

    async function fetchFacilityIndex({ pageSize = 500 } = {}) {
        if (!window.kf) throw new Error("window.kf not found");
        const kf = window.kf;
        const all = [];
        let page = 1;
        while (true) {
            const url =
                `/form/2/${ACCOUNT_ID}/Facilities_Slot_Master_A00/view/Facilities_Slot_Master_Table_A00/list` +
                `?apply_preference=true&page_number=${page}&page_size=${pageSize}` +
                `&_application_id=${encodeURIComponent(APP_ID)}`;
            const res = await kf.api(url, { method: "GET" });
            const batch = Array.isArray(res?.Data) ? res.Data : [];
            all.push(...batch);
            if (batch.length < pageSize) break;
            page++;
        }
        return all;
    }

    async function fetchFacilityDetail(formId) {
        if (!window.kf) throw new Error("window.kf not found");
        const kf = window.kf;
        const url =
            `/form/2/${ACCOUNT_ID}/Facilities_Slot_Master_A00/view/Facilities_Slot_Master_Table_A00/${encodeURIComponent(formId)}` +
            `?_application_id=${encodeURIComponent(APP_ID)}`;
        const res = await kf.api(url, { method: "GET" });
        return res;
    }

    // === Time math: gcd/lcm ===
    function gcd(a, b) { while (b) { const t = b; b = a % b; a = t; } return a; }
    function lcm(a, b) { if (!a || !b) return a || b || 15; return (a * b) / gcd(a, b); }

    function splitIntoBuckets(start, end, minutes) {
        const out = [];
        let t = new Date(start);
        while (t < end) {
            const nxt = addMin(t, minutes);
            if (nxt > end) break;
            out.push({ start: new Date(t), end: new Date(nxt) });
            t = nxt;
        }
        return out;
    }

    function subtractOffRanges(s, e, offRanges) {
        for (const r of (offRanges || [])) {
            if (overlaps(s, e, r.start, r.end)) return null;
        }
        return { start: s, end: e };
    }

    function countDutyInBucket(bucketStart, bucketEnd, openRanges) {
        let count = 0;
        for (const r of openRanges) {
            if (r.start <= bucketStart && r.end >= bucketEnd) {
                count += (r.capacityPerSlot || 1);
            }
        }
        return count;
    }

    function buildFacilityOpenRanges(detail, viewStart, viewEnd) {
        const weekly = Array.isArray(detail?.["Table::Weekly_Slot"]) ? detail["Table::Weekly_Slot"] : [];
        const offRaw = Array.isArray(detail?.["Table::Day_Off_Schedule"]) ? detail["Table::Day_Off_Schedule"] : [];

        const offRanges = offRaw
            .map(od => ({ start: parseAPIOffsetDate(od.Start_Date), end: parseAPIOffsetDate(od.End_Date) }))
            .filter(r => r.start && r.end && r.start < r.end);

        const out = [];

        weekly.forEach(slot => {
            const dow = slot?.Day_of_Week;
            if (!dow || !DOW_MAP[dow]) return;
            const [sH, sM] = String(slot.Start_Time || "08:00").split(":").map(n => parseInt(n, 10) || 0);
            const [eH, eM] = String(slot.End_Time || "17:00").split(":").map(n => parseInt(n, 10) || 0);
            const effFrom = slot?.Effective_Date_From ? parseDateYMD(slot.Effective_Date_From) : viewStart;
            const effTo = slot?.Effective_Date_To ? parseDateYMD(slot.Effective_Date_To) : viewEnd;

            const dt0 = firstOccurrenceOnOrAfter(effFrom, DOW_MAP[dow].idx);
            const rule = new RRule({ freq: RRule.WEEKLY, interval: 1, byweekday: [DOW_MAP[dow].rrule], dtstart: dt0, until: effTo });
            const dates = rule.between(viewStart, viewEnd, true);

            dates.forEach(d => {
                const s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), sH, sM);
                const e = new Date(d.getFullYear(), d.getMonth(), d.getDate(), eH, eM);
                const kept = subtractOffRanges(s, e, offRanges);
                if (!kept) return;
                out.push({
                    start: kept.start,
                    end: kept.end,
                    slotMinute: Number(slot.Slot_Minute || 30),
                    capacityPerSlot: Number(slot.Capacity_Per_Slot || 1),
                });
            });
        });

        return out;
    }

    function buildXrayDoctorOpenRanges(docDetailsMap, viewStart, viewEnd) {
        const out = [];
        for (const id of Object.keys(docDetailsMap || {})) {
            const d = docDetailsMap[id];
            const doctorTypeDefault = (d?.Doctor_Type || "").toLowerCase();
            const weekly = Array.isArray(d?.["Table::Weekly_Slot"]) ? d["Table::Weekly_Slot"] : [];
            const offRaw = Array.isArray(d?.["Table::Off_Day_Schedule_1"]) ? d["Table::Off_Day_Schedule_1"] : [];
            const offRanges = offRaw
                .map(od => ({ start: parseAPIOffsetDate(od.Start_Date), end: parseAPIOffsetDate(od.End_Date) }))
                .filter(r => r.start && r.end && r.start < r.end);

            weekly.forEach(slot => {
                const type = String(slot?.Doctor_Type || doctorTypeDefault).toLowerCase();
                if (type !== "x-ray") return;

                const dow = slot?.Day_of_Week;
                if (!dow || !DOW_MAP[dow]) return;
                const [sH, sM] = String(slot.Start_Time || "08:00").split(":").map(n => parseInt(n, 10) || 0);
                const [eH, eM] = String(slot.End_Time || "17:00").split(":").map(n => parseInt(n, 10) || 0);

                const effFrom = slot?.Effective_From ? parseDateYMD(slot.Effective_From) : viewStart;
                const effTo = slot?.Effective_Till ? parseDateYMD(slot.Effective_Till) : viewEnd;

                const dt0 = firstOccurrenceOnOrAfter(effFrom, DOW_MAP[dow].idx);
                const rule = new RRule({ freq: RRule.WEEKLY, interval: 1, byweekday: [DOW_MAP[dow].rrule], dtstart: dt0, until: effTo });
                const dates = rule.between(viewStart, viewEnd, true);

                dates.forEach(d0 => {
                    const s = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), sH, sM);
                    const e = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), eH, eM);
                    const kept = subtractOffRanges(s, e, offRanges);
                    if (!kept) return;
                    out.push({
                        start: kept.start,
                        end: kept.end,
                        slotMinute: Number(slot.Slot_Duration || 15),
                        capacityPerSlot: 1,
                        doctor_code: d?.Doctor_Code || id,
                        doctor_name: d?.Doctor_Name || "",
                    });
                });
            });
        }
        return out;
    }

    function buildFacilityFreeEvents({ facilityDetail, doctorOpenRanges, viewStart, viewEnd }) {
        const facName = facilityDetail?.Facilities_Name || "";
        const facRequireDoctor = !!facilityDetail?.Require_Doctor;

        const facRanges = buildFacilityOpenRanges(facilityDetail, viewStart, viewEnd);
        if (!facRanges.length) return [];

        const sampleFacSlot = facRanges.find(Boolean)?.slotMinute || 30;
        const sampleDocSlot = doctorOpenRanges.find(Boolean)?.slotMinute || sampleFacSlot;
        const base = lcm(sampleFacSlot, sampleDocSlot);

        const out = [];

        facRanges.forEach(fr => {
            const buckets = splitIntoBuckets(fr.start, fr.end, base);

            buckets.forEach(({ start, end }) => {
                const facUnits = countDutyInBucket(start, end, facRanges);
                if (facUnits <= 0) return;

                let docUnits = 0;
                if (facRequireDoctor) {
                    docUnits = countDutyInBucket(start, end, doctorOpenRanges);
                    if (docUnits <= 0) return;
                } else {
                    docUnits = Infinity;
                }

                const freeCount = Math.min(facUnits, docUnits);
                if (freeCount > 0) {
                    out.push({
                        id: `FAC_${facName}_${toLocalIsoNoMillis(start)}`,
                        title: `ว่าง ${freeCount} คิว`,
                        start, end,
                        resource: { facility: facName, free_count: freeCount },
                        aggregated: true,
                    });
                }
            });
        });

        return out;
    }

    /* ---- Build schedules & bookings (จาก API เดิม + อิงตัวเลือกจาก PREDEFINED) ---- */
    useEffect(() => {
        (async () => {
            const viewStart = new Date(2025, 8, 1);
            const viewEnd = addDays(viewStart, 90);

            const bookingIndex = new Map();
            for (const b of bookings) {
                const doctorCode = String(b.Doctor_Code || "").trim();
                const start = parseAPIOffsetDate(b.Appointment_Date_Start);
                const end = parseAPIOffsetDate(b.Appointment_Date_End);
                if (!doctorCode || !start || !end || end <= start) continue;
                const key = bookingKey(doctorCode, start);
                if (!bookingIndex.has(key)) bookingIndex.set(key, [b]);
                else bookingIndex.get(key).push(b);
            }

            const allDoctor = [];
            const allXray = [];

            for (const d of doctors) {
                const id = d._id;
                const docData = docDetailsMap[id];
                if (!docData) continue;

                const doctorName = docData?.Doctor_Name ?? "(Unknown)";
                const doctorCode = docData?.Doctor_Code ?? id;
                const weekly = Array.isArray(docData?.["Table::Weekly_Slot"]) ? docData["Table::Weekly_Slot"] : [];
                const offRaw = Array.isArray(docData?.["Table::Off_Day_Schedule_1"]) ? docData["Table::Off_Day_Schedule_1"] : [];
                const offRanges = offRaw
                    .map(od => ({ start: parseAPIOffsetDate(od.Start_Date), end: parseAPIOffsetDate(od.End_Date), clinic: od.Clinic_Off_Day || null }))
                    .filter(r => r.start && r.end && r.start < r.end);

                const doctorTypeDefault = (docData?.Doctor_Type || d.doctorType || "").toLowerCase();

                for (const slot of weekly) {
                    const day = slot?.Day_of_Week;
                    if (!day || !DOW_MAP[day]) continue;

                    const clinic = slot?.Clinic_Weekly_Schedule ?? "";
                    const patientType = slot?.Patient_Type ?? "Any";
                    const slotMin = Number(slot?.Slot_Duration ?? 15);
                    const effFrom = slot?.Effective_From ? parseDateYMD(slot.Effective_From) : viewStart;
                    const effTill = slot?.Effective_Till ? parseDateYMD(slot.Effective_Till) : viewEnd;
                    const [sH, sM] = String(slot?.Start_Time ?? "09:00").split(":").map(n => parseInt(n, 10) || 0);
                    const [eH, eM] = String(slot?.End_Time ?? "12:00").split(":").map(n => parseInt(n, 10) || 0);

                    const doctorType = (slot?.Doctor_Type ?? doctorTypeDefault ?? "").toLowerCase();
                    const facilityName = slot?.Facilities_Name ?? slot?.Facility_Name ?? docData?.Facilities_Name ?? docData?.Facility_Name ?? "";

                    const firstDay = firstOccurrenceOnOrAfter(effFrom, DOW_MAP[day].idx);
                    const dtstart = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate(), sH, sM, 0, 0);

                    const rule = new RRule({
                        freq: RRule.WEEKLY, interval: 1, byweekday: [DOW_MAP[day].rrule], dtstart, until: effTill,
                    });

                    const occurDates = rule.between(viewStart, viewEnd, true);

                    occurDates.forEach((dateOcc) => {
                        const resource = {
                            doctor: doctorName, doctor_code: doctorCode,
                            clinic, type: patientType, doctor_type: doctorType, facility: facilityName,
                        };
                        let evs = generateSlotsForDay(dateOcc, sH, sM, eH, eM, slotMin, `${doctorName} (${day})`, resource);

                        // ตัดวันหยุด
                        evs = evs.filter(ev => !offRanges.some(r => {
                            if (r.clinic && String(r.clinic) !== String(clinic)) return false;
                            return overlaps(ev.start, ev.end, r.start, r.end);
                        }));

                        // Mark booked (เฉพาะ doctor)
                        evs = evs.map(ev => {
                            const k = bookingKey(doctorCode, ev.start);
                            const arr = bookingIndex.get(k);
                            if (arr && arr.length) {
                                const primary = arr[0];
                                const itemIds = arr.map(x => x.Item_ID || x._id).filter(Boolean);
                                const formattedTitle = buildBookedEventTitle(ev, primary);
                                const title = arr.length > 1
                                    ? `${formattedTitle}\n(+${arr.length - 1} รายการ)`
                                    : formattedTitle;
                                return { ...ev, booked: true, item_ids: itemIds, booked_count: arr.length, title };
                            }
                            return ev;
                        });

                        if (doctorType === "x-ray") allXray.push(...evs);
                        else if (selectedDoctorIds.includes(id)) allDoctor.push(...evs); // ใช้ตัวเลือกจาก PREDEFINED (map แล้ว)
                    });
                }
            }

            setEventsDoctor(allDoctor);

            // 2) doctor(X-ray) open ranges
            const xrayDoctorOpenRanges = buildXrayDoctorOpenRanges(docDetailsMap, viewStart, viewEnd);

            // 3) facility free slots รวม
            let facilityIndex = [];
            let facilityEvents = [];
            try {
                facilityIndex = await fetchFacilityIndex();
                for (const row of facilityIndex) {
                    const formId = row.Form_ID || row._id || row.Item_ID;
                    if (!formId) continue;
                    const detail = await fetchFacilityDetail(formId);
                    const evs = buildFacilityFreeEvents({
                        facilityDetail: detail,
                        doctorOpenRanges: xrayDoctorOpenRanges,
                        viewStart,
                        viewEnd
                    });
                    facilityEvents.push(...evs);
                }
            } catch (e) {
                console.error("Load facility free slots failed:", e);
            }

            setEventsXray(facilityEvents);
        })();
    }, [doctors, selectedDoctorIds, docDetailsMap, bookings, selectedClinic]);

    /* ===== Unified calendar handlers ===== */
    const detectKind = (event) => {
        if (event._kind) return event._kind;
        if (event?.resource?.status) return "or";
        if ((event?.resource?.doctor_type || "").toLowerCase() === "x-ray" || event?.aggregated) return "facility";
        return "doctor";
    };

    const onSelectUnifiedEvent = (event) => {
        const kind = detectKind(event);
        if (kind === "doctor") {
            if (event.booked) return;
            setSelectedDoctorEvent(prev => (prev && prev.id === event.id ? null : event));
            setCommittedDoctorId(prev => (prev === event.id ? null : event.id));
            return;
        }
        if (kind === "facility") {
            if (event.booked) return;
            setSelectedXrayEventId(prev => (prev === event.id ? null : event.id));

            const slotFacility = event?.resource?.facility || "";
            //const ns = toLocalIsoNoMillis(event.start);
            const ns = toLocalNoTZ(event.start);
            //const ne = toLocalIsoNoMillis(event.end);
            const ne = toLocalNoTZ(event.end);
            const dur = minutesBetween(event.start, event.end);

            setFacilityRows(prev => {
                if (!prev.length) return prev; // "Add" ปิดอยู่ ถ้าไม่มีแถวก็ไม่ทำอะไร
                const idx = focusedCell ? prev.findIndex(r => r.rowId === focusedCell.rowId) : 0; // ถ้าไม่ได้โฟกัส ใช้แถวแรก
                if (idx === -1) return prev;
                const prevLinkedId = prev[idx]._linkedEventId || null;
                const rows = [...prev];
                rows[idx] = {
                    ...rows[idx],
                    Facilities_Name: rows[idx].Facilities_Name || slotFacility,
                    Start_Time: ns,
                    End_Time: ne,
                    Duration_Min: dur,
                    _linkedEventId: event.id,
                };
                setCommittedXrayIds(s => { const t = new Set(s); if (prevLinkedId) t.delete(prevLinkedId); t.add(event.id); return t; });
                return rows;
            });
            setFocusedCell(null);
            return;
        }
        if (kind === "or") {
            if (event?.resource?.status === "Tentative") {
                setSelectedOrEventId(prev => prev === event.id ? null : event.id);
            }
            return;
        }
    };

    const onSelectSlotUnified = ({ start, end, action }) => {
        if (!orDrawMode) return; // ค่าเริ่มจาก PREDEFINED
        if (action !== "select") return;

        const id = `OR_T_${Date.now()}`;
        const blockStart = addMin(start, -OR_DEFAULT_SETUP_MIN);
        const blockEnd = addMin(end, OR_DEFAULT_CLEANUP_MIN);

        const newEv = { id, title: `Tentative • OR`, start, end, resource: { or: "", status: "Tentative" }, blockStart, blockEnd };
        setEventsOR(prev => [...prev, newEv]);
        setSelectedOrEventId(id);

        orPreviewRef.current = {
            Procedure_Start: toLocalIsoNoMillis(start),
            Procedure_End: toLocalIsoNoMillis(end),
            Setup_Buffer_Min: OR_DEFAULT_SETUP_MIN,
            Cleanup_Buffer_Min: OR_DEFAULT_CLEANUP_MIN,
            Resource_Locks: [{ Type: "OR", Key: "", Start: toLocalIsoNoMillis(blockStart), End: toLocalIsoNoMillis(blockEnd) }],
            Status: "Tentative",
        };
    };

    const eventPropGetterUnified = (event) => {
        const kind = detectKind(event);

        if (kind === "doctor" && confirmedDoctorIds.has(event.id))
            return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };
        if (kind === "facility" && confirmedXrayIds.has(event.id))
            return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };
        if (kind === "or" && event?.resource?.status === "Confirmed")
            return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };

        if (kind === "doctor" && event.booked)
            return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };

        let style = { border: 0 };
        if (kind === "doctor") style = { ...style, backgroundColor: "#3b82f6", color: "#fff" };
        if (kind === "facility") {
            const fac = event?.resource?.facility || "";
            style = { ...style, backgroundColor: facilityColor(fac), color: facilityTextColor() };
        }
        if (kind === "or") {
            style = { ...style, backgroundColor: event?.resource?.status === "Tentative" ? "#a78bfa" : "#6b7280", color: "#fff" };
            if (selectedOrEventId === event.id && event?.resource?.status === "Tentative") {
                style.outline = "2px solid #dc2626";
            }
            return { style };
        }

        const selected = (kind === "doctor" && selectedDoctorEvent?.id === event.id);
        const committed = (kind === "doctor" && committedDoctorId === event.id);
        if (selected) style = { ...style, outline: "2px solid #1d4ed8", boxShadow: "0 0 0 2px #1d4ed8 inset" };
        if (committed) style = { ...style, outline: "2px solid #16a34a", boxShadow: "0 0 0 2px #16a34a inset" };

        return { style };
    };

    const unifiedEvents = useMemo(() => {
        const tag = (ev, kind) => ({ ...ev, _kind: kind });
        return [
            ...eventsDoctor.map(e => tag(e, "doctor")),
            ...eventsXray.map(e => tag(e, "facility")),
            ...eventsOR.map(e => tag(e, "or")),
        ];
    }, [eventsDoctor, eventsXray, eventsOR]);

    // ===== Confirm Handler =====
    const handleConfirm = async () => {
        try {
            if (!window.kf) throw new Error("window.kf not found (must run inside Kissflow)");
            const kf = window.kf;

            // item id ตามที่ระบุในสเปค
            const appVariable1 = await kf.app.getVariable("Appointment_Transaction_Instance_ID");
            let targetId = appVariable1;
            // const targetId = "PkC5IVnrYNTU";

            // เริ่มสร้าง payload ตามที่กำหนด
            const payload = {
                _id: targetId,
                Appointment_Status: "Confirm",
                "Table::Physician_OR": [], // ตามสเปคให้ส่งว่าง
            };

            // 1) Slot แพทย์ -> Appointment_Date_Start / Appointment_Date_End
            if (selectedDoctorEvent) {
                // payload.Appointment_Date_Start = toLocalIsoNoMillis(new Date(selectedDoctorEvent.start));
                // payload.Appointment_Date_End = toLocalIsoNoMillis(new Date(selectedDoctorEvent.end));
                payload.Appointment_Date_Start = toKFDateTime(selectedDoctorEvent.start);
                payload.Appointment_Date_End = toKFDateTime(selectedDoctorEvent.end);
            }

            // 2) Slot Facilities -> Table::Facility_1 (map ตาม Facility Name)
            const facRows = facilityRows
                .filter(r => r.Facilities_Name && r.Start_Time && r.End_Time)
                .map(r => ({
                    Facility_Name: r.Facilities_Name,
                    Start_Time_Facility: toKFDateTime(r.Start_Time), // ใช้ค่าจาก input/selection โดยตรง
                    End_Time_Facility: toKFDateTime(r.End_Time),
                }));
            payload["Table::Facility_1"] = facRows;

            // Modal สรุปก่อนยืนยัน
            const lines = [];
            if (selectedDoctorEvent) {
                const s = selectedDoctorEvent.start, e = selectedDoctorEvent.end;
                lines.push(`แพทย์: ${fmtDateDDMMYYYY(s)} (${fmtHHmm(s)} - ${fmtHHmm(e)})`);
            }
            lines.push(`\nFacility: ${facRows.length} รายการ`);
            facRows.forEach((r, idx) => {
                const sd = toDateSafe(r.Start_Time_Facility);
                const ed = toDateSafe(r.End_Time_Facility);
                const dateStr = sd ? fmtDateDDMMYYYY(sd) : '-';
                const timeStr = (sd && ed) ? `${fmtHHmm(sd)}-${fmtHHmm(ed)}` : '-';
                lines.push(`${idx + 1}. ${r.Facility_Name} : ${dateStr} (${timeStr})`);
            });


            await new Promise((resolve, reject) => {
                Modal.confirm({
                    title: "ยืนยันการบันทึกนัดหมาย?",
                    content: lines.join('\n'),
                    okText: "ยืนยัน",
                    cancelText: "ยกเลิก",
                    onOk: resolve,
                    onCancel: () => reject(new Error('cancel')),
                });
            });

            // POST ไปอัปเดตตาม item id
            const url = `/form/2/${ACCOUNT_ID}/Appointment_Transaction_A00/${encodeURIComponent(targetId)}?_application_id=${encodeURIComponent(APP_ID)}`;
            const resp = await kf.api(url, { method: "POST", body: JSON.stringify(payload) });
            console.info('Update response', resp);
            message.success("อัปเดตเรียบร้อย");

            // นำทางไปหน้า Page ID ที่ระบุ
            try {
                await navigateToPage("Appointment_Patient_A00");
            } catch (e) {
                console.warn("navigate to page failed (all fallbacks)", e);
                // แจ้งผู้ใช้แบบนุ่ม ๆ
                kf?.client?.showInfo?.("ไม่สามารถเปิดหน้า Appointment_Patient_A00 ได้");
            }
        } catch (err) {
            if (err && err.message === 'cancel') return; // กดยกเลิกที่ modal
            console.error('Confirm failed', err);
            message.error("บันทึกไม่สำเร็จ");
        }
    };

    // === Convert to Kissflow-friendly datetime: "YYYY-MM-DDTHH:mm:ss+07:00 Asia/Bangkok"
    function pad2(n) { return String(n).padStart(2, "0"); }
    function toKfStringFromDate(d) {
        const y = d.getFullYear();
        const M = pad2(d.getMonth() + 1);
        const D = pad2(d.getDate());
        const h = pad2(d.getHours());
        const m = pad2(d.getMinutes());
        const s = "00";
        // ใช้ +07:00 Asia/Bangkok เสมอ
        return `${y}-${M}-${D}T${h}:${m}:${s}+07:00 Asia/Bangkok`;
    }
    function toKFDateTime(v) {
        if (!v) return null;
        if (v instanceof Date) return toKfStringFromDate(v);
        const s = String(v);
        // ถ้า string อยู่ในรูปแบบ Asia/Bangkok อยู่แล้ว ให้ parse ก่อน
        const d = /Asia\//i.test(s) ? parseAPIOffsetDate(s) : new Date(s);
        if (isNaN(d)) return null;
        return toKfStringFromDate(d);
    }

    // สำหรับ modal display
    function fmtDDMMYYYY(d) { return format(d, 'dd/MM/yyyy'); }
    function fmtHHmm(d) { return format(d, 'HH:mm'); }
    function parseToDateSafe(v) {
        if (!v) return null;
        if (v instanceof Date) return v;
        return /Asia\//i.test(String(v)) ? parseAPIOffsetDate(v) : new Date(v);
    }

    async function navigateToPage(pageId, params = {}) {
        const kf = (window && window.kf) || {};
        try {
            // รองรับหลายเวอร์ชันของ SDK
            if (kf.app?.page?.open) {
                return await kf.app.page.open(pageId, params);
            }
            if (kf.app?.page?.openPage) {
                return await kf.app.page.openPage(pageId, params);
            }
            if (kf.app?.openPage) {
                return await kf.app.openPage(pageId, params);
            }
            if (kf.client?.openPage) {
                return await kf.client.openPage(pageId, params);
            }
            if (kf.navigate?.openPage) {
                return await kf.navigate.openPage(pageId, params);
            }

            // Fallback สุดท้าย: เด้ง hash ไปยัง page id (ใช้ได้ในบาง shell)
            if (window?.location) {
                window.location.hash = `#/page/${encodeURIComponent(pageId)}`;
                return;
            }
            throw new Error("No navigation method available");
        } catch (err) {
            console.warn("Navigation failed with all strategies:", err);
            throw err;
        }
    }



    /* =========================
    * Render
    * ========================= */
    return (
        <div style={{ height: "100%", minHeight: 560, padding: 0 }}>
            {/* Filters + OR tools (ทั้งหมดดึงจาก PREDEFINED และปิดแก้ไข) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "end", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: 6 }}>เลือกคลินิก :</label>
                        <Select
                            allowClear style={{ width: 320 }}
                            value={selectedClinic ?? undefined}
                            onChange={() => { /* disabled */ }}
                            options={clinicOptions}
                            showSearch optionFilterProp="label" placeholder="เลือกคลินิก…"
                            disabled
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: 6 }}>เลือกแพทย์ :</label>
                        <Select
                            mode="multiple"
                            style={{ width: 520 }}
                            value={selectedDoctorIds}
                            onChange={() => { /* disabled */ }}
                            options={filteredDoctorsNonXray.map(d => ({ value: d._id, label: `${d.name} — (${d.code || d._id})` }))}
                            showSearch
                            optionFilterProp="label"
                            placeholder="เลือกแพทย์…"
                            disabled
                        />
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>ลากเพื่อสร้าง OR:</span>
                    <Switch checked={orDrawMode} onChange={() => { /* disabled */ }} disabled />
                    <Button disabled={!selectedOrEventId} danger onClick={() => { /* disabled */ }} disabled >ลบ OR (Tentative)</Button>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Button type="primary" onClick={handleConfirm}>Confirm</Button>
                    <Button onClick={() => { /* คุณยังสามารถเชื่อมต่อ handleReset ได้*/ }}>Reset</Button>
                </div>
            </div>

            {/* Facilities Usage (legacy) — แสดงค่าจาก PREDEFINED และปิดแก้ไข */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>Facilities Usage</div>
                <button
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #999", background: "#f3f4f6", color: "#6b7280", cursor: "not-allowed" }}
                    disabled
                >
                    + เพิ่ม Facility
                </button>
            </div>

            {
                facilityRows.map((r) => (
                    <div key={r.rowId}
                        style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1.4fr 0.8fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                        <Select value={r.Facilities_Name || undefined} options={facilities} placeholder="เลือก Facilities_Name" showSearch optionFilterProp="label" disabled />
                        <Input
                            value={r.Start_Time || ""}
                            onFocus={() => setFocusedCell({ rowId: r.rowId, field: "Start_Time" })}
                            onChange={(e) => setFacilityRows(rows => rows.map(x => x.rowId === r.rowId ? { ...x, Start_Time: e.target.value } : x))}
                        />
                        <Input value={r.End_Time || ""} readOnly />
                        <Input value={r.Duration_Min} readOnly />
                        <Input value={r.Room} readOnly />
                        <Input value={r.Technician} readOnly />
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #ddd", background: "#f3f4f6", color: "#6b7280", cursor: "not-allowed" }} disabled>
                                ลบ
                            </button>
                        </div>
                    </div>
                ))
            }

            {/* ปฏิทินรวม (ยังดึงจาก API เดิม) */}
            <Calendar
                selectable={orDrawMode}
                localizer={localizer}
                events={unifiedEvents}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                views={["day", "week", "month"]}
                step={15}
                min={new Date(2025, 0, 1, 6, 0)}
                max={new Date(2025, 0, 1, 20, 0)}
                onSelectEvent={onSelectUnifiedEvent}
                onSelectSlot={onSelectSlotUnified}
                eventPropGetter={eventPropGetterUnified}
                style={{ height: 720, background: "#fff", marginTop: 8 }}
            />
        </div >
    );
}




