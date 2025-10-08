// import React, { useEffect, useMemo, useState } from "react";
// import { Calendar, dateFnsLocalizer } from "react-big-calendar";
// import { RRule } from "rrule";
// import {
//     format, parse, startOfWeek, getDay,
//     addDays, addMinutes
// } from "date-fns";
// import enUS from "date-fns/locale/en-US";
// import "react-big-calendar/lib/css/react-big-calendar.css";

// // ✅ Ant Design
// import { Select } from "antd";

// const locales = { "en-US": enUS };
// const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// // ===== Helper: ฟอร์แมต "YYYY-MM-DDTHH:mm:ss"
// function toLocalIsoNoMillis(date) {
//     const pad = (n) => String(n).padStart(2, "0");
//     const y = date.getFullYear();
//     const M = pad(date.getMonth() + 1);
//     const d = pad(date.getDate());
//     const h = pad(date.getHours());
//     const m = pad(date.getMinutes());
//     return `${y}-${M}-${d}T${h}:${m}:00`;
// }

// // key สำหรับจับคู่ booking กับ slot (ตามหมอ + เวลาเริ่ม)
// function bookingKey(doctorCode, startDate) {
//     // normalize วินาทีเป็น 00 เพื่อตรงกับ slot ที่เราสร้าง (ถ้า slot ไม่มีวินาที)
//     const pad = (n) => String(n).padStart(2, "0");
//     const y = startDate.getFullYear();
//     const M = pad(startDate.getMonth() + 1);
//     const d = pad(startDate.getDate());
//     const h = pad(startDate.getHours());
//     const m = pad(startDate.getMinutes());
//     const s = "00";
//     return `${doctorCode}__${y}-${M}-${d}T${h}:${m}:${s}`;
// }

// // ===== Helper: สร้างช่องนัดภายใน 1 วัน ตามช่วงเวลาและขนาด slot (นาที)
// function generateSlotsForDay(date, startH, startM, endH, endM, slotMinutes, title, resource) {
//     const slots = [];
//     let start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startH, startM);
//     const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endH, endM);

//     while (start < end) {
//         const slotEnd = addMinutes(start, slotMinutes);
//         slots.push({
//             id: `${resource.doctor_code}_${date.toDateString()}_${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
//             title,
//             start: new Date(start),
//             end: slotEnd,
//             resource
//         });
//         start = slotEnd;
//     }
//     return slots;
// }

// // ===== แปลง Day_of_Week -> RRule weekday และ index
// const DOW_MAP = {
//     Sun: { rrule: RRule.SU, idx: 0 },
//     Mon: { rrule: RRule.MO, idx: 1 },
//     Tue: { rrule: RRule.TU, idx: 2 },
//     Wed: { rrule: RRule.WE, idx: 3 },
//     Thu: { rrule: RRule.TH, idx: 4 },
//     Fri: { rrule: RRule.FR, idx: 5 },
//     Sat: { rrule: RRule.SA, idx: 6 },
// };

// // หา "วันที่แรก" ที่ตรง day_of_week ตั้งแต่ effective_from (รวมวันเดียวกัน)
// function firstOccurrenceOnOrAfter(effFromDate, dowIdx) {
//     const d = new Date(effFromDate);
//     const delta = (dowIdx - d.getDay() + 7) % 7;
//     d.setDate(d.getDate() + delta);
//     return d;
// }

// // รายการคลินิก fix (หรือ derive จาก doctors ก็ได้)
// const CLINIC_OPTIONS = [
//     "คลินิค ตรวจสุขภาพ / Wellness Clinic",
//     "คลินิคมะเร็งเต้านม / Breast Oncology Clinic",
//     "คลินิคศัลยกรรมตกแต่ง / Plastic and Reconstructive Clinic",
//     "คลินิคหัวใจ (มะเร็งวิทยา) / Onco-Cardiology Clinic",
//     "คลินิคเต้านม / Breast Clinic",
//     "รังสีวินิจฉัยเต้านม / Breast Diagnostic",
//     "ห้องฉุกเฉิน / Emergency/Acute Care",
// ];

// export default function AppointmentCalendar() {
//     const [doctors, setDoctors] = useState([]);
//     const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);
//     const [selectedClinic, setSelectedClinic] = useState(null);
//     const [events, setEvents] = useState([]);

//     // ===== Load doctors =====
//     useEffect(() => {
//         (async () => {
//             const accountId = kf.account._id;
//             const appId = kf.app._id;
//             let api_key = "Ak505582b3-7ef3-4e7e-aef2-277d18f85d9a";
//             let api_secret_key =
//                 "DavF2azfkJOlaewrMkqb4qmyeB9QZtUJuVgXtGBVYrjtCFUaudoiSCQBs0CY2N0mLd31UQTfjL8T7a11EZ4qWw";
//             if (accountId === "Ac6CKwftOewF") {
//                 api_key = "Ake71a4e4d-d739-4e74-a5e7-c9c5cc33980d";
//                 api_secret_key =
//                     "pkgaKYje-0PumPThV1pyOvhagVTZ70Lf3ubJmYEo0KOyFmo5ycbXAY8AcRXNeRcaMpFPf5PCW1VTNPKGav9HA";
//             }
//             const option_post = {
//                 method: "POST",
//                 headers: {
//                     "X-Access-Key-Id": api_key,
//                     "X-Access-Key-Secret": api_secret_key,
//                 },
//             };
//             try {
//                 const resp = await kf.api(
//                     `/form/2/${accountId}/Weekly_Slot_Dataform_A00/view/Doctor_Slot_Management_A01/list?apply_preference=true&page_number=1&page_size=500&_application_id=${appId}`,
//                     option_post
//                 );
//                 const list = resp?.Data ?? [];
//                 const mapped = list.map((row) => ({
//                     _id: row._id,
//                     name: row.Doctor_Name || `Doctor ${row._id}`,
//                     code: row.Doctor_Code || "",
//                     concatClinic: row.Concat_Clinic || "",
//                 }));
//                 setDoctors(mapped);
//                 if (mapped.length > 0) setSelectedDoctorIds([mapped[0]._id]);
//             } catch (err) {
//                 console.error("load doctors failed", err);
//             }
//         })();
//     }, []);

//     // ===== Filter doctors by clinic =====
//     const filteredDoctors = useMemo(() => {
//         if (!selectedClinic) return doctors;
//         return doctors.filter((d) => {
//             const clinics = String(d.concatClinic || "")
//                 .split(",")
//                 .map((s) => s.trim())
//                 .filter(Boolean);
//             return clinics.includes(selectedClinic);
//         });
//     }, [doctors, selectedClinic]);

//     useEffect(() => {
//         if (!selectedClinic) return;
//         const visibleIds = new Set(filteredDoctors.map((d) => d._id));
//         setSelectedDoctorIds((ids) => ids.filter((id) => visibleIds.has(id)));
//     }, [selectedClinic, filteredDoctors]);

//     // ===== คำนวณ events จากข้อมูลจริงของหมอที่เลือก =====
//     useEffect(() => {
//         (async () => {
//             const viewStart = new Date(2025, 8, 1);
//             const viewEnd = addDays(viewStart, 300);

//             // --- header เตรียมเรียก API ---
//             const accountId = kf.account._id;
//             const appId = kf.app._id;
//             let api_key = "Ak505582b3-7ef3-4e7e-aef2-277d18f85d9a";
//             let api_secret_key = "DavF2azfkJOlaewrMkqb4qmyeB9QZtUJuVgXtGBVYrjtCFUaudoiSCQBs0CY2N0mLd31UQTfjL8T7a11EZ4qWw";
//             if (accountId === "Ac6CKwftOewF") {
//                 api_key = "Ake71a4e4d-d739-4e74-a5e7-c9c5cc33980d";
//                 api_secret_key = "pkgaKYje-0PumPThV1pyOvhagVTZ70Lf3ubJmYEo0KOyFmo5ycbXAY8AcRXNeRcaMpFPf5PCW1VTNPKGav9HA";
//             }
//             const option_get = {
//                 method: "GET",
//                 headers: {
//                     "X-Access-Key-Id": api_key,
//                     "X-Access-Key-Secret": api_secret_key,
//                 },
//             };

//             // =========================================
//             // 2.1 โหลด BOOKING LIST แล้วทำ index
//             //    (สมมติคุณมี endpoint สำหรับดึง booking list ทั้งหมดช่วงนี้)
//             //    ถ้า endpoint ของคุณเป็นแบบอื่น ให้แทน URL นี้ได้เลย
//             // =========================================
//             let bookingIndex = new Map();
//             try {
//                 const bookingResp = await kf.api(
//                     // <--- แทน URL นี้ด้วยของคุณเอง (list bookings)
//                     // ตัวอย่าง: `/form/2/${accountId}/Appointment_A01/view/Booking_List/list?...`
//                     `/form/2/${accountId}/Appointment_Transaction_A00/view/Add_Data_A50/list?page_number=1&page_size=500&_application_id=${appId}`,
//                     { method: "POST", headers: { "X-Access-Key-Id": api_key, "X-Access-Key-Secret": api_secret_key } }
//                 );
//                 const bookings = Array.isArray(bookingResp?.Data) ? bookingResp.Data : [];

//                 // ถ้าคุณมี bookings เป็น array "ตามตัวอย่างที่ส่งมา" อยู่แล้ว ก็ใช้ bookings = <array> ได้เลย
//                 // const bookings = YOUR_ARRAY_FROM_API;

//                 for (const b of bookings) {
//                     const doctorCode = String(b.Doctor_Code || "").trim();
//                     const start = parseAPIOffsetDate(b.Appointment_Date_Start);
//                     const end = parseAPIOffsetDate(b.Appointment_Date_End);
//                     if (!doctorCode || !start || !end || end <= start) continue;

//                     const k = bookingKey(doctorCode, start);
//                     const itemId = b.Item_ID || b._id;

//                     if (!bookingIndex.has(k)) {
//                         bookingIndex.set(k, { item_ids: [itemId], first: b });
//                     } else {
//                         bookingIndex.get(k).item_ids.push(itemId);
//                     }
//                 }
//             } catch (err) {
//                 console.error("load booking list failed", err);
//             }



//             // =========================================
//             // 2.2 จากนั้นโหลดตารางหมอตาม selectedDoctorIds (เหมือนเดิม)
//             // =========================================
//             const allEvents = [];

//             for (const id of selectedDoctorIds) {
//                 try {
//                     const docData = await kf.api(
//                         `/form/2/${accountId}/Weekly_Slot_Dataform_A00/view/Doctor_Slot_Management_A01/${id}?_application_id=${appId}`,
//                         option_get
//                     );

//                     const doctorName = docData?.Doctor_Name ?? "(Unknown)";
//                     const doctorCode = docData?.Doctor_Code ?? id;

//                     const weekly = Array.isArray(docData?.["Table::Weekly_Slot"])
//                         ? docData["Table::Weekly_Slot"]
//                         : [];

//                     // (มีส่วน Off Day แล้วอยู่ก่อนหน้า — คงไว้เหมือนเดิมได้)
//                     const offRaw = Array.isArray(docData?.["Table::Off_Day_Schedule_1"])
//                         ? docData["Table::Off_Day_Schedule_1"]
//                         : [];
//                     const doctorOffs = offRaw.filter(
//                         x => !x?.Doctor_Code_Off_Day || String(x.Doctor_Code_Off_Day) === String(doctorCode)
//                     );
//                     const offRanges = doctorOffs.map(od => ({
//                         start: parseAPIOffsetDate(od.Start_Date),
//                         end: parseAPIOffsetDate(od.End_Date),
//                         clinic: od.Clinic_Off_Day || null,
//                     })).filter(r => r.start && r.end && r.start < r.end);

//                     for (const slot of weekly) {
//                         const day = slot?.Day_of_Week; // "Mon", "Tue", ...
//                         if (!day || !DOW_MAP[day]) continue;

//                         const clinic = slot?.Clinic_Weekly_Schedule ?? "";
//                         const patientType = slot?.Patient_Type ?? "Any";
//                         const slotMin = Number(slot?.Slot_Duration ?? 15);

//                         // yyyy-mm-dd → local date
//                         const effFrom = slot?.Effective_From ? parseDateYMD(slot.Effective_From) : viewStart;
//                         const effTill = slot?.Effective_Till ? parseDateYMD(slot.Effective_Till) : viewEnd;

//                         const [sH, sM] = String(slot?.Start_Time ?? "09:00").split(":").map(n => parseInt(n, 10) || 0);
//                         const [eH, eM] = String(slot?.End_Time ?? "12:00").split(":").map(n => parseInt(n, 10) || 0);

//                         const firstDay = firstOccurrenceOnOrAfter(effFrom, DOW_MAP[day].idx);
//                         const dtstart = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate(), sH, sM, 0, 0);

//                         const rule = new RRule({
//                             freq: RRule.WEEKLY,
//                             interval: 1,
//                             byweekday: [DOW_MAP[day].rrule],
//                             dtstart,
//                             until: effTill,
//                         });

//                         const occurDates = rule.between(viewStart, viewEnd, true);

//                         occurDates.forEach((d) => {
//                             const resource = {
//                                 doctor: doctorName,
//                                 doctor_code: doctorCode,
//                                 clinic,
//                                 type: patientType,
//                             };

//                             // สร้าง slot ย่อย
//                             let evs = generateSlotsForDay(d, sH, sM, eH, eM, slotMin, `${doctorName} (${day})`, resource);

//                             // 1) ตัดด้วย Off Day
//                             evs = evs.filter(ev => {
//                                 for (const r of offRanges) {
//                                     if (r.clinic && String(r.clinic) !== String(clinic)) continue;
//                                     if (ev.start < r.end && r.start < ev.end) return false;
//                                 }
//                                 return true;
//                             });

//                             // 2) ทำ “จองแล้ว” ถ้ามี booking ตรงเวลา + หมอ
//                             evs = evs.map(ev => {
//                                 const k = bookingKey(doctorCode, ev.start);
//                                 const bk = bookingIndex.get(k);
//                                 if (bk) {
//                                     const itemIds = bk.item_ids;
//                                     return {
//                                         ...ev,
//                                         booked: true,
//                                         item_ids: itemIds,                // <-- array
//                                         booked_count: itemIds.length,     // <-- nice to show
//                                         title: `${ev.title} • (จองแล้ว ${itemIds.length})`,
//                                     };
//                                 }
//                                 return ev;
//                             });


//                             allEvents.push(...evs);
//                         });
//                     }
//                 } catch (err) {
//                     console.error(`load schedule failed for doctor ${id}`, err);
//                 }
//             }

//             setEvents(allEvents);
//         })();
//     }, [selectedDoctorIds]);


//     const eventPropGetter = (event) => {
//         if (event.booked) {
//             // darker if multiple
//             const bg = event.booked_count > 1 ? "#e91e63" : "#ff5722";
//             return { style: { backgroundColor: bg, color: "#fff", border: 0 } };
//         }
//         return {};
//     };


//     // ==== helper: parse 'yyyy-mm-dd' (local, no timezone surprises)
//     function parseDateYMD(str) {
//         const [y, m, d] = String(str).split("-").map(n => parseInt(n, 10));
//         return new Date(y, (m || 1) - 1, d || 1);
//     }

//     // ==== helper: parse API datetime like '2025-09-24T05:00:00+07:00 Asia/Bangkok'
//     function parseAPIOffsetDate(str) {
//         if (!str) return null;
//         // ตัดชื่อโซน ' Asia/...' ออก เหลือแค่ ISO+offset
//         const isoWithOffset = String(str).split(" Asia/")[0];
//         const dt = new Date(isoWithOffset);
//         return isNaN(dt) ? null : dt;
//     }

//     // ==== check overlap of two intervals [aStart,aEnd) & [bStart,bEnd)
//     function overlaps(aStart, aEnd, bStart, bEnd) {
//         return aStart < bEnd && bStart < aEnd;
//     }


//     const handleSelectEvent = async (event) => {
//         // if this slot already has bookings → open all in one popup call
//         if (event.item_ids && event.item_ids.length > 0) {
//             console.info(event)
//             const concatenated = event.item_ids.join(","); // "id1,id2,id3"
//             return kf.app.page.openPopup("Popup_2Ik18mitvK", {
//                 item_id: concatenated,
//             });
//         }

//         // ...otherwise, create new item(s) as you already do ...
//     };


//     return (
//         <div style={{ height: "100%", minHeight: 680 }}>
//             <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
//                 <div>
//                     <label style={{ display: "block", marginBottom: 6 }}>เลือกคลินิก:</label>
//                     <Select
//                         allowClear
//                         style={{ width: 420 }}
//                         placeholder="เลือกคลินิก… (ว่าง = ทั้งหมด)"
//                         value={selectedClinic ?? undefined}
//                         onChange={(v) => setSelectedClinic(v ?? null)}
//                         options={CLINIC_OPTIONS.map((c) => ({ value: c, label: c }))}
//                         showSearch
//                         optionFilterProp="label"
//                     />
//                 </div>
//                 <div>
//                     <label style={{ display: "block", marginBottom: 6 }}>เลือกแพทย์:</label>
//                     <Select
//                         mode="multiple"
//                         style={{ width: 480 }}
//                         placeholder={selectedClinic ? `กรองโดยคลินิก: ${selectedClinic}` : "เลือกแพทย์…"}
//                         value={selectedDoctorIds}
//                         onChange={setSelectedDoctorIds}
//                         options={filteredDoctors.map((d) => ({
//                             value: d._id,
//                             label: `${d.name} — (${d.code})`,
//                         }))}
//                         // maxTagCount="responsive"
//                         showSearch
//                         optionFilterProp="label"
//                     />
//                 </div>
//             </div>


//             <Calendar
//                 localizer={localizer}
//                 events={events}
//                 startAccessor="start"
//                 endAccessor="end"
//                 defaultView="week"
//                 views={["day", "week", "month"]}
//                 step={5}
//                 // timeslots={4}
//                 min={new Date(2025, 0, 1, 6, 0)}
//                 max={new Date(2025, 0, 1, 19, 0)}
//                 onSelectEvent={handleSelectEvent}
//                 eventPropGetter={eventPropGetter}
//                 style={{ height: 600, background: "#fff", width: 600 }}
//             />
//         </div>
//     );
// }
