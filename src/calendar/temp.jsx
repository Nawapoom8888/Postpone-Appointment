// ---- Event Click ----
    // const handleSelectEvent = async (event) => {
    //     const accid = kf.account._id;

    //     // ถ้าเคยมีแล้ว → เปิด popup เดิม
    //     if (bookedSlots[event.id]) {
    //         let { instanceId, activityInstanceId } = bookedSlots[event.id];
    //         let item_detail = await kf.api(`/process/2/${accid}/admin/Appointment_A01/${instanceId}`)
    //         console.info(item_detail)
    //         kf.app.page.openPopup("Popup_OyjYD4jX5R", {
    //             popinstanceid: instanceId,
    //             popactiveinstanceid: item_detail._current_context[0]._context_activity_instance_id,
    //             // popactiveinstanceid: activityInstanceId,
    //         });
    //         return;
    //     }

    //     // ถ้ายังไม่เคย → New Item
    //     const payload = {
    //         Doctor_Name: event.resource.doctor,
    //         Doctor_Code: "000001",
    //         Clinic: event.resource.clinic,
    //         Appointment_Start_Time: toLocalIsoNoMillis(event.start),
    //         Duration: 15,
    //     };

    //     try {
    //         const resp = await kf.api(
    //             `/process/2/${accid}/Appointment_A01?application_id=Hospital_Information_Systems_HIS_A00`,
    //             {
    //                 method: "POST",
    //                 body: JSON.stringify(payload),
    //             }
    //         );

    //         // เก็บ mapping
    //         setBookedSlots((prev) => ({
    //             ...prev,
    //             [event.id]: {
    //                 instanceId: resp._id,
    //                 activityInstanceId: resp._activity_instance_id,
    //             },
    //         }));

    //         // เปิด popup ใหม่
    //         console.info("InstanceID", resp._id, resp._activity_instance_id)
    //         kf.app.page.openPopup("Popup_OyjYD4jX5R", {
    //             popinstanceid: resp._id,
    //             popactiveinstanceid: resp._activity_instance_id,
    //         });
    //     } catch (err) {
    //         console.error("New item failed:", err);
    //         kf.client.showInfo("❌ สร้างรายการไม่สำเร็จ");
    //     }
    // };

    // ---- เปลี่ยนสีถ้าเคย New Item แล้ว ----
    
    // const eventPropGetter = (event) => {
    //     if (bookedSlots[event.id]) {
    //         return { style: { backgroundColor: "orange", color: "#fff" } };
    //     }
    //     return {};
    // };
    // function toLocalIsoNoMillis(date) {
    //     const pad = (n) => String(n).padStart(2, "0");
    //     const y = date.getFullYear();
    //     const M = pad(date.getMonth() + 1);
    //     const d = pad(date.getDate());
    //     const h = pad(date.getHours());
    //     const m = pad(date.getMinutes());
    //     const s = pad(date.getSeconds()); // หรือ "00" ถ้าต้องการ fix วินาทีเป็นศูนย์
    //     return `${y}-${M}-${d}T${h}:${m}:${s}+07:00 Asia/Bangkok`;
    // }


//     {
//     "_id": "Add_Data_A50",
//     "Columns": [
//         {
//             "Id": "Prefix_Name",
//             "Name": "Prefix Name",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "First_Name",
//             "Name": "First Name",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Last_Name",
//             "Name": "Last Name",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "HN_Number",
//             "Name": "HN Number",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Phone_Number",
//             "Name": "Phone Number",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Email_1",
//             "Name": "Email",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Line_ID",
//             "Name": "Line ID",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Birth_Date",
//             "Name": "Birth Date",
//             "Type": "Date",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "ID_Card__Passport_Number",
//             "Name": "ID Card / Passport Number",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Appointment_Reason",
//             "Name": "Appointment Reason",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "On_Site_Appointment",
//             "Name": "On Site Appointment",
//             "Type": "Boolean",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Appointment_Date_Start",
//             "Name": "Appointment Date (Start)",
//             "Type": "DateTime",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Appointment_Date_End",
//             "Name": "Appointment Date (End)",
//             "Type": "DateTime",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Appointment_Status",
//             "Name": "Appointment Status",
//             "Type": "Select",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Doctor_Name",
//             "Name": "Doctor Name",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Doctor_Code",
//             "Name": "Doctor Code",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Untitled_Field_1",
//             "Name": "Appointment ID",
//             "Type": "Text",
//             "ReadOnly": false,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Item_ID",
//             "Name": "Item ID",
//             "Type": "Text",
//             "ReadOnly": true,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Add_Data_A50",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         }
//     ],
//     "Sort": [],
//     "Filter": {},
//     "Data": [
//         {
//             "Prefix_Name": "นาย",
//             "First_Name": "จินดา",
//             "Last_Name": "รุ่งเรือง",
//             "HN_Number": "2500003",
//             "Phone_Number": "0812374227",
//             "Email_1": "jinda@test.com",
//             "Line_ID": "0812374227",
//             "Birth_Date": "1990-05-01",
//             "ID_Card__Passport_Number": "138324287234",
//             "Appointment_Reason": "เวียนหัว",
//             "On_Site_Appointment": true,
//             "Appointment_Date_Start": "2025-09-22T08:00:00+07:00 Asia/Bangkok",
//             "Appointment_Date_End": "2025-09-22T08:15:00+07:00 Asia/Bangkok",
//             "Appointment_Status": "Confirm",
//             "Doctor_Name": "รศ.พญ. เยาวนุช คงด่าน ( Assoc.Prof.Dr. Youwanush Kongdan )",
//             "Doctor_Code": "100001",
//             "Untitled_Field_1": "Pk8spW5U_s81",
//             "Item_ID": "PkC5IOb2guG7",
//             "_id": "PkC5IOb2guG7"
//         },
//         {
//             "Prefix_Name": "นางสาว",
//             "First_Name": "ทดสอบ",
//             "Last_Name": "ที่หมาย",
//             "HN_Number": "2400003",
//             "Phone_Number": "0812312344",
//             "Email_1": "sd@gmail.com",
//             "Birth_Date": "2000-02-10",
//             "ID_Card__Passport_Number": "12368379478172",
//             "Appointment_Reason": "ปวดเมื่อย",
//             "On_Site_Appointment": true,
//             "Appointment_Date_Start": "2025-09-29T10:00:00+07:00 Asia/Bangkok",
//             "Appointment_Date_End": "2025-09-29T10:15:00+07:00 Asia/Bangkok",
//             "Appointment_Status": "Confirm",
//             "Doctor_Name": "รศ.พญ. เยาวนุช คงด่าน ( Assoc.Prof.Dr. Youwanush Kongdan )",
//             "Doctor_Code": "100001",
//             "Untitled_Field_1": "Pk8spW5U_s81",
//             "Item_ID": "PkC5IVnrYNTU",
//             "_id": "PkC5IVnrYNTU"
//         },
//         {
//             "Prefix_Name": "นางสาว",
//             "First_Name": "หมีน้อย",
//             "Last_Name": "คอยรัก",
//             "HN_Number": "2400005",
//             "Phone_Number": "0623647589",
//             "Email_1": "Example@gmail.com",
//             "Birth_Date": "1996-08-14",
//             "ID_Card__Passport_Number": "0123456789101",
//             "Appointment_Reason": "เจ็บแผลผ่าตัด",
//             "On_Site_Appointment": true,
//             "Appointment_Date_Start": "2025-09-26T08:00:00+07:00 Asia/Bangkok",
//             "Appointment_Date_End": "2025-09-16T08:15:00+07:00 Asia/Bangkok",
//             "Appointment_Status": "Confirm",
//             "Doctor_Name": "รศ.พญ. เยาวนุช คงด่าน ( Assoc.Prof.Dr. Youwanush Kongdan )",
//             "Doctor_Code": "100001",
//             "Untitled_Field_1": "Weekly_Slot_OjzQQ-fPi7",
//             "Item_ID": "PkC5IZ5bH9f7",
//             "_id": "PkC5IZ5bH9f7"
//         }
//     ],
//     "count": 3,
//     "ComponentFilter": {}
// }



// {
//     "_id": "Doctor_Slot_Management_A01",
//     "Columns": [
//         {
//             "Id": "Doctor_Code",
//             "Name": "Doctor Code",
//             "Type": "Text",
//             "ReadOnly": true,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Doctor_Slot_Management_A01",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Form_ID",
//             "Name": "Form ID",
//             "Type": "Text",
//             "ReadOnly": true,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Doctor_Slot_Management_A01",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Doctor_Name",
//             "Name": "Doctor Name",
//             "Type": "Text",
//             "ReadOnly": true,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Doctor_Slot_Management_A01",
//             "Widget": null,
//             "Required": false,
//             "IsInternal": false
//         },
//         {
//             "Id": "Concat_Clinic",
//             "Name": "Concat Clinic",
//             "Type": "Text",
//             "ReadOnly": true,
//             "Width": null,
//             "MapTo": null,
//             "IsSecondary": null,
//             "IsSystemField": false,
//             "Model": "Doctor_Slot_Management_A01",
//             "Widget": "Aggregation",
//             "Required": false,
//             "IsInternal": false
//         }
//     ],
//     "Sort": [],
//     "Filter": {},
//     "Data": [
//         {
//             "Doctor_Code": "100001",
//             "Form_ID": "Pk8spW5Tz8PS",
//             "Doctor_Name": "รศ.พญ. เยาวนุช คงด่าน ( Assoc.Prof.Dr. Youwanush Kongdan )",
//             "Concat_Clinic": "คลินิคมะเร็งเต้านม / Breast Oncology Clinic,คลินิคมะเร็งเต้านม / Breast Oncology Clinic,คลินิคมะเร็งเต้านม / Breast Oncology Clinic,คลินิคมะเร็งเต้านม / Breast Oncology Clinic",
//             "_id": "Pk8spW5Tz8PS"
//         },
//         {
//             "Doctor_Code": "500013",
//             "Form_ID": "Pk8x8pASyQs8",
//             "Doctor_Name": "พญ. ปวีณา เลือดไทย ( Dr. Paweena Luadthai )",
//             "Concat_Clinic": "คลินิคมะเร็งเต้านม / Breast Oncology Clinic",
//             "_id": "Pk8x8pASyQs8"
//         },
//         {
//             "Doctor_Code": "500007",
//             "Form_ID": "Pk8x8ofc5nH8",
//             "Doctor_Name": "ผศ.นพ. ธงชัย ศุกรโยธิน ( Asst.Prof.Dr. Thongchai Sukarayothin )",
//             "Concat_Clinic": "คลินิคมะเร็งเต้านม / Breast Oncology Clinic",
//             "_id": "Pk8x8ofc5nH8"
//         }
//     ],
//     "count": 3,
//     "ComponentFilter": {}
// }