// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Calendar, dateFnsLocalizer } from "react-big-calendar";
// import { RRule } from "rrule";
// import {
//     format, parse, startOfWeek, getDay,
//     addDays, addMinutes
// } from "date-fns";
// import enUS from "date-fns/locale/en-US";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { Select, Input } from "antd";

// /* =========================
//  * Localizer
//  * ========================= */
// const locales = { "en-US": enUS };
// const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// /* =========================
//  * Helpers
//  * ========================= */
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
//     const pad = (n) => String(n).padStart(2, "0");
//     const y = date.getFullYear();
//     const M = pad(date.getMonth() + 1);
//     const d = pad(date.getDate());
//     const h = pad(date.getHours());
//     const m = pad(date.getMinutes());
//     return `${y}-${M}-${d}T${h}:${m}:00`;
// }
// function minutesBetween(a, b) {
//     return Math.max(1, Math.round((b.getTime() - a.getTime()) / 60000));
// }
// function generateSlotsForDay(date, startH, startM, endH, endM, slotMinutes, title, resource) {
//     const slots = [];
//     let start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startH, startM);
//     const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endH, endM);
//     while (start < end) {
//         const slotEnd = addMinutes(start, slotMinutes);
//         slots.push({
//             id: `${resource.doctor_code || resource.facility || "res"}_${date.toDateString()}_${String(
//                 start.getHours()
//             ).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
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
// function overlaps(aStart, aEnd, bStart, bEnd) {
//     return aStart < bEnd && bStart < aEnd;
// }
// function bookingKey(doctorCode, startDate) {
//     const pad = (n) => String(n).padStart(2, "0");
//     const y = startDate.getFullYear();
//     const M = pad(startDate.getMonth() + 1);
//     const d = pad(startDate.getDate());
//     const h = pad(startDate.getHours());
//     const m = pad(startDate.getMinutes());
//     return `${doctorCode}__${y}-${M}-${d}T${h}:${m}:00`;
// }
// /** Aggregate เฉพาะ X-ray: รวม “ว่าง N คิว” โดยแยกตามเวลา + ชื่อ Facility */
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

// /* ===== Facility coloring + highlight ===== */
// function hashStr(s = "") {
//     let h = 0;
//     for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
//     return Math.abs(h);
// }
// function facilityColor(name = "") {
//     if (!name) return "#06b6d4";
//     const h = hashStr(name) % 360;
//     const s = 70;
//     const l = 48;
//     return `hsl(${h} ${s}% ${l}%)`;
// }
// function facilityTextColor() { return "#fff"; }

// /* =========================
//  * MOCK DATA (แทน API)
//  * ========================= */
// const MOCK_DOCTORS = [
//     {
//         _id: "Pk8spW5Tz8PS",
//         name: "รศ.พญ. เยาวนุช คงด่าน ( Assoc.Prof.Dr. Youwanush Kongdan )",
//         code: "100001",
//         concatClinic: "คลินิคมะเร็งเต้านม / Breast Oncology Clinic,คลินิคเต้านม / Breast Clinic",
//         doctorType: "general",
//     },
//     {
//         _id: "Pk8x8pASyQs8",
//         name: "พญ. ปวีณา เลือดไทย ( Dr. Paweena Luadthai )",
//         code: "500013",
//         concatClinic: "คลินิคมะเร็งเต้านม / Breast Oncology Clinic",
//         doctorType: "general",
//     },
//     {
//         _id: "Pk8x8ofc5nH8",
//         name: "ผศ.นพ. ธงชัย ศุกรโยธิน ( Asst.Prof.Dr. Thongchai Sukarayothin )",
//         code: "500007",
//         concatClinic: "รังสีวินิจฉัยเต้านม / Breast Diagnostic",
//         doctorType: "x-ray",
//     },
// ];
// const MOCK_DOC_DETAILS = {
//     Pk8spW5Tz8PS: {
//         Doctor_Name: MOCK_DOCTORS[0].name,
//         Doctor_Code: MOCK_DOCTORS[0].code,
//         Doctor_Type: "general",
//         "Table::Weekly_Slot": [
//             { Day_of_Week: "Mon", Clinic_Weekly_Schedule: "คลินิคมะเร็งเต้านม / Breast Oncology Clinic", Patient_Type: "Any", Slot_Duration: 15, Effective_From: "2025-09-01", Effective_Till: "2025-12-31", Start_Time: "09:00", End_Time: "14:00" },
//             { Day_of_Week: "Tue", Clinic_Weekly_Schedule: "คลินิคเต้านม / Breast Clinic", Patient_Type: "Any", Slot_Duration: 15, Effective_From: "2025-09-01", Effective_Till: "2025-12-31", Start_Time: "13:00", End_Time: "15:00" },
//         ],
//         "Table::Off_Day_Schedule_1": [
//             { _id: "Off_1", Doctor_Code_Off_Day: "100001", Start_Date: "2025-09-12T10:00:00+07:00 Asia/Bangkok", End_Date: "2025-09-27T10:00:00+07:00 Asia/Bangkok", Reason: "ลาพักร้อน" },
//             { _id: "Off_2", Doctor_Code_Off_Day: "100001", Clinic_Off_Day: "คลินิคเต้านม / Breast Clinic", Start_Date: "2025-09-24T05:00:00+07:00 Asia/Bangkok", End_Date: "2025-09-24T13:00:00+07:00 Asia/Bangkok", Reason: "ประชุมวิชาการ" },
//         ],
//     },
//     Pk8x8pASyQs8: {
//         Doctor_Name: MOCK_DOCTORS[1].name,
//         Doctor_Code: MOCK_DOCTORS[1].code,
//         Doctor_Type: "general",
//         "Table::Weekly_Slot": [
//             { Day_of_Week: "Wed", Clinic_Weekly_Schedule: "คลินิคมะเร็งเต้านม / Breast Oncology Clinic", Patient_Type: "Any", Slot_Duration: 20, Effective_From: "2025-09-01", Effective_Till: "2025-12-31", Start_Time: "09:00", End_Time: "12:00" },
//         ],
//         "Table::Off_Day_Schedule_1": [],
//     },
//     Pk8x8ofc5nH8: {
//         Doctor_Name: MOCK_DOCTORS[2].name,
//         Doctor_Code: MOCK_DOCTORS[2].code,
//         Doctor_Type: "x-ray",
//         Facilities_Name: "X-ray Room 1",
//         "Table::Weekly_Slot": [
//             { Day_of_Week: "Mon", Clinic_Weekly_Schedule: "รังสีวินิจฉัยเต้านม / Breast Diagnostic", Patient_Type: "Any", Slot_Duration: 15, Effective_From: "2025-09-01", Effective_Till: "2025-12-31", Start_Time: "10:00", End_Time: "12:00", Doctor_Type: "x-ray", Facilities_Name: "X-ray Room 1" },
//             { Day_of_Week: "Fri", Clinic_Weekly_Schedule: "รังสีวินิจฉัยเต้านม / Breast Diagnostic", Patient_Type: "Any", Slot_Duration: 15, Effective_From: "2025-09-01", Effective_Till: "2025-12-31", Start_Time: "13:00", End_Time: "15:00", Doctor_Type: "x-ray", Facilities_Name: "X-ray Room 2" },
//         ],
//         "Table::Off_Day_Schedule_1": [],
//     },
// };
// const MOCK_BOOKINGS = [
//     { _id: "PkC5IOb2guG7", Item_ID: "PkC5IOb2guG7", Doctor_Code: "100001", Appointment_Date_Start: "2025-09-22T08:00:00+07:00 Asia/Bangkok", Appointment_Date_End: "2025-09-22T08:15:00+07:00 Asia/Bangkok" },
//     { _id: "PkC5IVnrYNTU", Item_ID: "PkC5IVnrYNTU", Doctor_Code: "100001", Appointment_Date_Start: "2025-09-29T10:00:00+07:00 Asia/Bangkok", Appointment_Date_End: "2025-09-29T10:15:00+07:00 Asia/Bangkok" },
// ];
// const MOCK_FACILITIES = [
//     { value: "Abdominal Ultrasound", label: "Abdominal Ultrasound" },
//     { value: "BMD", label: "BMD" },
//     { value: "Breast Intervention", label: "Breast Intervention" },
//     { value: "Breast Ultrasound", label: "Breast Ultrasound" },
//     { value: "Digital Mammography / 3D Mammogram", label: "Digital Mammography / 3D Mammogram" },
//     { value: "X-ray", label: "X-ray" },
// ];


// /* =========================
//  * Component
//  * ========================= */
// export default function AppointmentCalendar() {
//     // Doctors/Clinics
//     const [doctors, setDoctors] = useState([]);
//     const [clinicOptions, setClinicOptions] = useState([]);
//     const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);
//     const [selectedClinic, setSelectedClinic] = useState(null);

//     // Facilities rows
//     const [facilities, setFacilities] = useState([]);
//     const [facilityRows, setFacilityRows] = useState([]);

//     // Calendars events
//     const [eventsDoctor, setEventsDoctor] = useState([]); // non X-ray
//     const [eventsXray, setEventsXray] = useState([]);     // X-ray aggregated

//     // Selection / focus
//     const [selectedDoctorEvent, setSelectedDoctorEvent] = useState(null);
//     const [selectedXrayEventId, setSelectedXrayEventId] = useState(null);
//     const [focusedCell, setFocusedCell] = useState(null); // { rowId, field: "Start_Time" | "End_Time" }

//     // Committed highlights (stick)
//     const [committedDoctorId, setCommittedDoctorId] = useState(null);
//     const [committedXrayIds, setCommittedXrayIds] = useState(new Set());

//     const [confirmedDoctorIds, setConfirmedDoctorIds] = useState(new Set());
//     const [confirmedXrayIds, setConfirmedXrayIds] = useState(new Set());

//     // Input refs for auto-focus after adding a row
//     const inputRefs = useRef(new Map());
//     const [lastAddedRowId, setLastAddedRowId] = useState(null);
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
//             if (el.scrollIntoView) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
//         }
//         setLastAddedRowId(null);
//     }, [lastAddedRowId]);

//     /* ---- Load doctors/facilities (MOCK) ---- */
//     useEffect(() => {
//         setDoctors(MOCK_DOCTORS);
//         const opts = Array.from(
//             new Set(
//                 MOCK_DOCTORS.flatMap(d =>
//                     String(d.concatClinic || "")
//                         .split(",").map(s => s.trim()).filter(Boolean)
//                 )
//             )
//         ).map(c => ({ value: c, label: c }));
//         setClinicOptions(opts);
//     }, []);
//     useEffect(() => {
//         setFacilities(MOCK_FACILITIES);
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

//     /* ---- Build schedules & bookings (MOCK) ---- */
//     useEffect(() => {
//         (async () => {
//             const viewStart = new Date(2025, 8, 1);
//             const viewEnd = addDays(viewStart, 90);

//             // Booking Index (MOCK)
//             const bookingIndex = new Map();
//             for (const b of MOCK_BOOKINGS) {
//                 const doctorCode = String(b.Doctor_Code || "").trim();
//                 const start = parseAPIOffsetDate(b.Appointment_Date_Start);
//                 const end = parseAPIOffsetDate(b.Appointment_Date_End);
//                 if (!doctorCode || !start || !end || end <= start) continue;
//                 const k = bookingKey(doctorCode, start);
//                 const itemId = b.Item_ID || b._id;
//                 if (!bookingIndex.has(k)) bookingIndex.set(k, { item_ids: [itemId] });
//                 else bookingIndex.get(k).item_ids.push(itemId);
//             }

//             const allDoctor = [];
//             const allXray = [];

//             for (const d of doctors) {
//                 const id = d._id;
//                 const docData = MOCK_DOC_DETAILS[id];
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
//                         freq: RRule.WEEKLY,
//                         interval: 1,
//                         byweekday: [DOW_MAP[day].rrule],
//                         dtstart,
//                         until: effTill,
//                     });

//                     const occurDates = rule.between(viewStart, viewEnd, true);

//                     occurDates.forEach((dateOcc) => {
//                         const resource = {
//                             doctor: doctorName,
//                             doctor_code: doctorCode,
//                             clinic,
//                             type: patientType,
//                             doctor_type: doctorType,
//                             facility: facilityName,
//                         };
//                         let evs = generateSlotsForDay(dateOcc, sH, sM, eH, eM, slotMin, `${doctorName} (${day})`, resource);

//                         // Off day cut
//                         evs = evs.filter(ev => !offRanges.some(r => {
//                             if (r.clinic && String(r.clinic) !== String(clinic)) return false;
//                             return overlaps(ev.start, ev.end, r.start, r.end);
//                         }));

//                         // Mark booked
//                         evs = evs.map(ev => {
//                             const k = bookingKey(doctorCode, ev.start);
//                             const bk = bookingIndex.get(k);
//                             if (bk) {
//                                 return {
//                                     ...ev,
//                                     booked: true,
//                                     item_ids: bk.item_ids,
//                                     booked_count: bk.item_ids.length,
//                                     title: `${ev.title} • (จองแล้ว ${bk.item_ids.length})`,
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
//             setEventsXray(aggregateFreeSlotsByTimeAndFacility(allXray));
//         })();
//     }, [doctors, selectedDoctorIds]);

//     /* ===== Facilities table helpers ===== */
//     const mkRow = (name = "") => ({
//         rowId: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
//         Facilities_Name: name,
//         Start_Time: null,
//         End_Time: null,
//         Duration_Min: 15,
//         Room: "",
//         Technician: "",
//         Remark: ""
//     });
//     const addEmptyFacilityRow = () => {
//         const newRow = mkRow();
//         setFacilityRows(rows => [...rows, newRow]);
//         setFocusedCell({ rowId: newRow.rowId, field: "Start_Time" });
//         setLastAddedRowId(newRow.rowId);
//     };
//     const duplicateFacilityRow = (row) => {
//         const newRow = {
//             ...row,
//             rowId: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
//             Start_Time: null,
//             End_Time: null,
//             _linkedEventId: undefined,
//         };
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

//     /* ===== Calendar selection handlers ===== */
//     const onSelectDoctorEvent = (event) => {
//         if (event.booked) return;
//         setSelectedDoctorEvent(prev => (prev && prev.id === event.id ? null : event));
//         setCommittedDoctorId(prev => (prev === event.id ? null : event.id));
//     };

//     // FIX: when changing facility slot for the same row, remove old committed id & add new one
//     const onSelectFacilityEvent = (event) => {
//         if (event.booked) return;

//         // highlight selected-now (blue)
//         setSelectedXrayEventId(prev => (prev === event.id ? null : event.id));

//         if (!focusedCell) {
//             console.log("โปรดกด + เพิ่มแถว แล้วคลิกช่อง Start_Time ก่อนเลือก Slot");
//             return;
//         }

//         const slotFacility = event?.resource?.facility || "";
//         const slotStart = event.start;
//         const slotEnd = event.end;
//         const { rowId, field } = focusedCell;

//         setFacilityRows(prevRows => {
//             const prevRow = prevRows.find(r => r.rowId === rowId);
//             const prevLinkedId = prevRow?._linkedEventId;

//             const nextRows = prevRows.map(row => {
//                 if (row.rowId !== rowId) return row;

//                 const nextFacilityName = row.Facilities_Name || slotFacility;

//                 let nextStart = row.Start_Time;
//                 let nextEnd = row.End_Time;

//                 if (field === "Start_Time") {
//                     nextStart = toLocalIsoNoMillis(slotStart);
//                     nextEnd = toLocalIsoNoMillis(slotEnd);
//                 } else if (field === "End_Time") {
//                     nextEnd = toLocalIsoNoMillis(slotEnd);
//                     if (!nextStart) nextStart = toLocalIsoNoMillis(slotStart);
//                 }

//                 let nextDur = row.Duration_Min;
//                 if (nextStart && nextEnd) {
//                     const s = new Date(nextStart);
//                     const e = new Date(nextEnd);
//                     nextDur = minutesBetween(s, e);
//                 }

//                 return {
//                     ...row,
//                     Facilities_Name: nextFacilityName,
//                     Start_Time: nextStart,
//                     End_Time: nextEnd,
//                     Duration_Min: nextDur,
//                     _linkedEventId: event.id,
//                 };
//             });

//             setCommittedXrayIds(prevSet => {
//                 const nextSet = new Set(prevSet);
//                 if (prevLinkedId) nextSet.delete(prevLinkedId);
//                 nextSet.add(event.id);
//                 return nextSet;
//             });

//             return nextRows;
//         });

//         setFocusedCell(null);
//     };

//     /* ===== eventPropGetter (styles) ===== */
//     const eventPropGetterDoctor = (event) => {
//         if (confirmedDoctorIds.has(event.id)) {
//             return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };
//         }
//         if (event.booked) {
//             return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };
//         }
//         const isSelectedNow = selectedDoctorEvent && selectedDoctorEvent.id === event.id;
//         const isCommitted = committedDoctorId === event.id;
//         let style = {};
//         if (isSelectedNow) style = { outline: "2px solid #1d4ed8", boxShadow: "0 0 0 2px #1d4ed8 inset" };
//         if (isCommitted) style = { ...style, outline: "2px solid #16a34a", boxShadow: "0 0 0 2px #16a34a inset" };
//         return { style };
//     };
//     const eventPropGetterXray = (event) => {
//         if (confirmedXrayIds.has(event.id)) {
//             return { style: { backgroundColor: "#6b7280", color: "#fff", border: 0 } };
//         }
//         if (event.booked) {
//             return { style: { backgroundColor: "#f97316", color: "#fff", border: 0 } };
//         }
//         const facility = event?.resource?.facility || "";
//         const bg = facilityColor(facility);
//         const fg = facilityTextColor(bg);
//         const isSelectedNow = selectedXrayEventId === event.id;
//         const isCommitted = committedXrayIds.has(event.id);
//         let style = { backgroundColor: bg, color: fg, border: 0 };
//         if (isSelectedNow) style = { ...style, outline: "2px solid #1d4ed8", boxShadow: "0 0 0 2px #1d4ed8 inset" };
//         if (isCommitted) style = { ...style, outline: "2px solid #16a34a", boxShadow: "0 0 0 2px #16a34a inset" };
//         return { style };
//     };

//     /* ===== legend for facilities (x-ray) ===== */
//     const facilityLegend = useMemo(() => {
//         const set = new Set(eventsXray.map(e => e?.resource?.facility).filter(Boolean));
//         return Array.from(set);
//     }, [eventsXray]);

//     /* ===== Submit (mock) ===== */
//     function buildAppointmentPayload(ev) {
//         if (!ev) return null;
//         const startIso = toLocalIsoNoMillis(ev.start) + "+07:00 Asia/Bangkok";
//         const duration = minutesBetween(ev.start, ev.end) || 15;
//         return {
//             Doctor_Name: ev?.resource?.doctor || "",
//             Doctor_Code: ev?.resource?.doctor_code || "",
//             Clinic: ev?.resource?.clinic || "",
//             Appointment_Start_Time: startIso,
//             Duration: duration,
//             // Patient_Type: ev?.resource?.type || "",
//         };
//     }
//     const normalizeLocal = (v) => {
//         if (!v) return null;
//         const d = new Date(v);
//         if (!isNaN(d)) return toLocalIsoNoMillis(d);
//         const m = String(v).match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
//         return m ? `${m[1]}:00` : String(v);
//     };
//     const handleConfirm = async () => {
//         if (!selectedDoctorEvent && facilityRows.length === 0) {
//             console.log("กรุณาเพิ่มอย่างน้อย 1 รายการ");
//             return;
//         }

//         // เก็บ ID ของ doctor slot
//         if (selectedDoctorEvent) {
//             setConfirmedDoctorIds(prev => new Set([...prev, selectedDoctorEvent.id]));
//         }

//         // เก็บ ID ของ facility slot ที่แถวอ้างอิง
//         setConfirmedXrayIds(prev => {
//             const next = new Set(prev);
//             facilityRows.forEach(r => {
//                 if (r._linkedEventId) next.add(r._linkedEventId);
//             });
//             return next;
//         });

//         // สร้าง payload ปกติ
//         const header = buildAppointmentPayload(selectedDoctorEvent);
//         const payload = {
//             ...(header || {}),
//             "Table::Facility": facilityRows.map(r => ({
//                 Facility_Name: r.Facilities_Name,
//                 Start_Time_Facility: normalizeLocal(r.Start_Time) + "+07:00 Asia/Bangkok",
//                 End_Time_Facility: normalizeLocal(r.End_Time) + "+07:00 Asia/Bangkok",
//                 // Duration_Min: r.Duration_Min,
//                 // Room: r.Room,
//                 // Technician: r.Technician,
//                 // Remark: r.Remark
//             })),
//         };
//         console.log("MOCK SUBMIT PAYLOAD:", payload);


//         try {
//             let account_id = await kf.account._id
//             const resp = await kf.api(
//                 `/process/2/${account_id}/Appointment_A01?application_id=Hospital_Information_Systems_HIS_A00`,
//                 {
//                     method: "POST",
//                     body: JSON.stringify(payload),
//                 }
//             );

//             // เปิด popup ใหม่
//             console.log(resp)
//             console.info("InstanceID", resp._id, resp._activity_instance_id)
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
//         setCommittedDoctorId(null);
//         setCommittedXrayIds(new Set());
//         setFacilityRows([]);
//         setFocusedCell(null);
//     };

//     /* =========================
//      * Render
//      * ========================= */
//     return (
//         <div style={{ height: "100%", minHeight: 680, padding: 12 }}>
//             {/* Toolbar */}
//             <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
//                 <div>
//                     <label style={{ display: "block", marginBottom: 6 }}>เลือกคลินิก :</label>
//                     <Select
//                         allowClear
//                         style={{ width: 320 }}
//                         value={selectedClinic ?? undefined}
//                         onChange={(v) => setSelectedClinic(v ?? null)}
//                         options={clinicOptions}
//                         showSearch
//                         optionFilterProp="label"
//                         placeholder="เลือกคลินิก…"
//                     />
//                 </div>

//                 <div>
//                     <label style={{ display: "block", marginBottom: 6 }}>เลือกแพทย์ :</label>
//                     <Select
//                         mode="multiple"
//                         style={{ width: 520 }}
//                         value={selectedDoctorIds}
//                         onChange={setSelectedDoctorIds}
//                         options={filteredDoctorsNonXray.map(d => ({ value: d._id, label: `${d.name} — (${d.code || d._id})` }))}
//                         showSearch
//                         optionFilterProp="label"
//                         // maxTagCount="responsive"
//                         placeholder="เลือกแพทย์…"
//                     />
//                 </div>
//             </div>

//             {/* Facilities Usage header + add row button */}
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

//             {/* Facilities rows */}
//             {facilityRows.map((r, idx) => (
//                 <div
//                     key={r.rowId}
//                     style={{
//                         display: "grid",
//                         gridTemplateColumns: "1.2fr 1.4fr 1.4fr 0.8fr 1fr 1fr auto",
//                         gap: 8,
//                         marginBottom: 8
//                     }}
//                 >
//                     <Select
//                         value={r.Facilities_Name || undefined}
//                         onChange={(val) =>
//                             setFacilityRows(rows => rows.map((x, i) => i === idx ? { ...x, Facilities_Name: val } : x))
//                         }
//                         options={facilities}
//                         placeholder="เลือก Facilities_Name"
//                         showSearch
//                         optionFilterProp="label"
//                     />

//                     <Input
//                         ref={(el) => setInputRef(`Start_Time:${r.rowId}`, el)}
//                         value={r.Start_Time || ""}
//                         onFocus={() => setFocusedCell({ rowId: r.rowId, field: "Start_Time" })}
//                         onChange={(e) =>
//                             setFacilityRows((rows) =>
//                                 rows.map((x, i) => (i === idx ? { ...x, Start_Time: e.target.value } : x))
//                             )
//                         }
//                         placeholder="Start_Time (โฟกัส แล้วไปคลิก Slot ใน X-ray)"
//                     />
//                     <Input
//                         value={r.End_Time || ""}
//                         onFocus={() => setFocusedCell({ rowId: r.rowId, field: "End_Time" })}
//                         onChange={(e) =>
//                             setFacilityRows((rows) =>
//                                 rows.map((x, i) => (i === idx ? { ...x, End_Time: e.target.value } : x))
//                             )
//                         }
//                         placeholder="End_Time (โฟกัส แล้วไปคลิก Slot ใน X-ray)"
//                     />
//                     {/* <Input
//                         type="number"
//                         min={1}
//                         value={r.Duration_Min}
//                         onChange={(e) =>
//                             setFacilityRows((rows) =>
//                                 rows.map((x, i) =>
//                                     i === idx ? { ...x, Duration_Min: +e.target.value || 1 } : x
//                                 )
//                             )
//                         }
//                         placeholder="Duration (min)"
//                     />
//                     <Input
//                         placeholder="Room"
//                         value={r.Room}
//                         onChange={(e) =>
//                             setFacilityRows((rows) =>
//                                 rows.map((x, i) => (i === idx ? { ...x, Room: e.target.value } : x))
//                             )
//                         }
//                     />
//                     <Input
//                         placeholder="Technician"
//                         value={r.Technician}
//                         onChange={(e) =>
//                             setFacilityRows((rows) =>
//                                 rows.map((x, i) => (i === idx ? { ...x, Technician: e.target.value } : x))
//                             )
//                         }
//                     /> */}

//                     <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
//                         {/* <button
//                             onClick={() => duplicateFacilityRow(r)}
//                             style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #999", background: "#fff", cursor: "pointer" }}
//                         >
//                             คัดลอก
//                         </button> */}
//                         <button
//                             onClick={() => removeFacilityRow(r.rowId)}
//                             style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #e11", background: "#fff", color: "#e11", cursor: "pointer" }}
//                         >
//                             ลบ
//                         </button>
//                     </div>

//                 </div>

//             ))}

//             {/* Selection readout */}
//             {/* <div style={{ fontSize: 12, color: "#555", margin: "8px 0 12px" }}>
//                 {selectedDoctorEvent
//                     ? `Selected Doctor slot: ${toLocalIsoNoMillis(selectedDoctorEvent.start)} — ${toLocalIsoNoMillis(selectedDoctorEvent.end)} (${selectedDoctorEvent?.resource?.doctor})`
//                     : "Selected Doctor slot: –"}
//                 {"  |  "}
//                 {selectedXrayEventId
//                     ? `Selected X-ray slot id: ${selectedXrayEventId}`
//                     : "Selected X-ray slot: –"}
//             </div> */}

//             <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
//                 <button
//                     onClick={handleConfirm}
//                     style={{ padding: "6px 12px", borderRadius: 8, border: 0, background: "#2563eb", color: "#fff", cursor: "pointer", height: 32 }}
//                 >
//                     Confirm
//                 </button>
//                 <button
//                     onClick={handleReset}
//                     style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #999", background: "#fff", cursor: "pointer", height: 32 }}
//                 >
//                     Reset
//                 </button>
//             </div>

//             {/* Two calendars */}
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
//                 {/* Left: Non X-ray */}
//                 <div>
//                     <h3 style={{ margin: "6px 0 8px" }}>เวลาลงตรวจของแพทย์</h3>
//                     <Calendar
//                         localizer={localizer}
//                         events={eventsDoctor}
//                         startAccessor="start"
//                         endAccessor="end"
//                         defaultView="week"
//                         views={["day", "week", "month"]}
//                         step={15}
//                         min={new Date(2025, 0, 1, 6, 0)}
//                         max={new Date(2025, 0, 1, 19, 0)}
//                         onSelectEvent={onSelectDoctorEvent}
//                         eventPropGetter={eventPropGetterDoctor}
//                         style={{ height: 600, background: "#fff" }}
//                     />
//                 </div>

//                 {/* Right: X-ray */}
//                 <div>
//                     <h3 style={{ margin: "6px 0 4px" }}>Facility Calendar</h3>
//                     {/* Legend */}
//                     {/* <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
//                         {facilityLegend.map(name => (
//                             <span key={name} style={{
//                                 display: "inline-flex",
//                                 alignItems: "center",
//                                 gap: 6,
//                                 padding: "2px 8px",
//                                 borderRadius: 999,
//                                 background: facilityColor(name),
//                                 color: facilityTextColor(facilityColor(name)),
//                                 fontSize: 12
//                             }}>
//                                 <span style={{
//                                     width: 10, height: 10, borderRadius: 999,
//                                     background: "rgba(255,255,255,0.8)"
//                                 }} />
//                                 {name}
//                             </span>
//                         ))}
//                     </div> */}

//                     <Calendar
//                         localizer={localizer}
//                         events={eventsXray}
//                         startAccessor="start"
//                         endAccessor="end"
//                         defaultView="week"
//                         views={["day", "week", "month"]}
//                         step={15}
//                         min={new Date(2025, 0, 1, 6, 0)}
//                         max={new Date(2025, 0, 1, 19, 0)}
//                         onSelectEvent={onSelectFacilityEvent}
//                         eventPropGetter={eventPropGetterXray}
//                         style={{ height: 600, background: "#fff" }}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// }
