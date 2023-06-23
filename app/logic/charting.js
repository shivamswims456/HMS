/* 
    The charting logic is implemented using this hack
    according to gantt is only highlightes till `date` - 1 beacause
    it assumes that work will be finished till that day, but in out case 
    highlisht shold be till `date` so counter balance it whenever chart is renedered
    a day is added to the end date and whenver updated a day is added to the start date


    it is also possible to supply end_date to tasks, here duration has been pref. 

*/




function days_btw(sd, ed) {

    /* Function for gettting difference between two days
     */

    //https://stackoverflow.com/a/2627493

    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((sd - ed) / oneDay));
    console.log(diffDays);
    return diffDays


}


function addDays(date, days) {
    /* Function for adding days to date
     */
    date.setDate(date.getDate() + days);
    return date;
}



function __ZOHO_dt(__date){

    /* Function for converting date according to account settings of alpina 
     */

    __date.setMinutes(__date.getMinutes() - __date.getTimezoneOffset());  
    
    let toUTC = __date.toUTCString(),
        f_split = toUTC.split(", ")[1].split(" GMT")[0].split(" ");
        z_dt = `${f_split.slice('',3).join("-")} ${f_split[3].split(":").slice("", 2).join(":")}`;

        console.log(`${f_split[3].split(":").slice("", 2).join(":")}`, "changed");
        
    return z_dt;
    
}




function load_gantt(load_data) {

    /*  Function for parsing data supplied by make_structrure to gantt

     */

    gantt.plugins({
        auto_scheduling: true,
        tooltip: true 
    });


    gantt.templates.tooltip_text = function(start,end,task){
      
        return `<div class="flex-column">
                    <div class="d-flex">
                        <div class = "d-flex" style="width:40%;">
                            <strong>Booking Name</strong>
                        </div>
                        <div class = "d-flex" style="width:50%;">
                            <span>${task.text}</span>
                        </div>
                    </div>
                    <div class="d-flex">
                        <div class = "d-flex" style="width:40%;">
                            <strong>Check In</strong>
                        </div>
                        <div class = "d-flex" style="width:50%;">
                            <span>${start.toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="d-flex">
                        <div class = "d-flex" style="width:40%;">
                            <strong>Check Out</strong>
                        </div>
                        <div class = "d-flex" style="width:50%;">
                            <span>${end.toLocaleString()}</span>
                        </div>
                    </div>
                </div>`;

    };


    gantt.templates.timeline_cell_class = function(task,date){

        let dc = "Check_In";

        if(date.getHours() == 0){

            dc = "Check_Out"
        }

        return dc

    };

    let booking_button = `<i class="bi bi-person-fill-add" style="font-size: 1.5rem; color: #36335d;" data-bs-toggle="modal" data-bs-target="#new_booking"></i>`;

    gantt.config.order_branch = true;
	gantt.config.order_branch_free = true;

    gantt.config.auto_types = true;
    //gantt.config.drag_resize = false;
    gantt.config.drag_links = false;
    //gantt.config.drag_move = false;
    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_compatibility = true;
    gantt.locale.labels.section_split = "Display";
    gantt.config.open_split_tasks = true;
    gantt.config.columns = [
        { name: "text", label: "Task name", tree: true, width: '120' },
        {name: "buttons",label: booking_button,width: 75}
    ]; // Labeling Columns

    //default lightbox definition

    let rooms = [];
    window.room_inventory.forEach((room)=>{
        rooms.push({key:room.ID, label:room.Room_No});
    });

  


    gantt.config.lightbox.sections = [
        {name:"Room", height:22, type:"select", options: rooms},  
        {name:"time", height:72, map_to:"auto", type:"time"} 
    ];

    gantt.locale.labels.section_Room = "Room";
    

    
    
    
    gantt.config.scales = [
        { unit: "day", step: 1, date: "%d %F" },
        
        { unit: "hour", step: 12, format: (date)=>{ 

            let dc = "Check In";

            if(date.getHours() == 0){
    
                dc = "Check Out"
            }
    
            return dc
    

            
        } },
    ];
    gantt.config.min_column_width = 100;

    
    


    gantt.templates.task_class = (start, end, task)=>{

    
        let css = "",
            state = gantt.getState();

        if(state.drag_id == task.id  && state.drag_mode == "move"){
            //overlapp trigger
            if(isOverlapDetected(task.id)){
                css += "overlapped-task";
            }
        }
        

        if(task.text.includes("Room")){
            //min duration hide
            css += "hide_parent"
        }

            

        return css;
    }

    //booking_rearrange();
    gantt.init("gantt_here"); 
 

    console.log(load_data);

    gantt.parse({ "data": load_data, "links": [] }); //parsing data
    console.log(window.loaded);
    if (!window.loaded){
        // adding event listners after the chart has rendered as 
        // adding before it causes 1-render triggers
        updateBookingChange();
        console.log("updateBookingChange");
        window.loaded = true;

    }
    

    window.parsed = true;
    window.terminal = false;
    
}


function make_structure(data, room_inventory, sd, range_duration) {

    /* Function for transforming ZOHO api data to gantt structure 
     */

    display_list = [];
    //parent_list = [];

    //console.log(data);

    room_inventory.forEach((room)=>{
        
        //adding all parent rooms as projects

        let room_no = room.Room_No;
         

        let lsd = sd.split("-"),
        psd = `${lsd[2]}-${lsd[1]}-${lsd[0]} 00:00`;

        
        display_list.push({
            id: room_no, text: "Room #" + room_no, start_date: psd,
            type: "project", render: "split", parent: "0", progress: 0,
            open: false, duration: range_duration, zid:room.ID
        });
    

    });

     
    

    

    data.forEach(booking => {

        //adding bookings

        let room_no = booking.Room_No.display_value;


        let ssd = new Date(booking.Occupancy_From)
        let eed = new Date(booking.Occupancy_To)
        let daysBtw = days_btw(eed, ssd);
        ssd.setMinutes(ssd.getMinutes() - ssd.getTimezoneOffset());  
        eed.setMinutes(eed.getMinutes() - eed.getTimezoneOffset());
        let bof = ssd.toISOString();
        let bot = eed.toISOString();
        let dbof = bof.slice(0, 10).split("-")
        let dbot = bot.slice(0, 10).split("-")
        let tbof = bof.split("T")[1].split(".")[0].split(":")
        let tbot = bot.split("T")[1].split(".")[0].split(":")
        let sbof = `${dbof[2]}-${dbof[1]}-${dbof[0]} ${tbof[0]}:${tbof[1]}`;
        let sbot = `${dbot[2]}-${dbot[1]}-${dbot[0]} ${tbot[0]}:${tbot[1]}`;
        let guest_name = booking.Guests.length != 0 ? ` (${booking.Guests[0].display_value.trim()}) `:``;
        console.log(sbof);

        display_list.push({
            id: booking.Reservation_Number, text: `Booking #${booking.Reservation_Number} ${guest_name}`,
            start_date: sbof,
            end_date:sbot, parent: room_no, progress: 0, open: true, zid:booking.ID
        });


    });




    return display_list;

}

function fetch_data() {
    
    /* Function for first fetch 
        and date filter update
     */


    var sd = $("#sd").val(),
        ed = $("#ed").val(),
        date = new Date();




    if (sd == '' || ed == '' || sd == null || ed == null) {

        console.log("default dates");

        sd = new Date(date.getFullYear(), date.getMonth(), 2);
        ed = new Date(date.getFullYear(), date.getMonth() + 1, 2),
            range_duration = days_btw(sd, ed);


    } else {

        console.log("from dates");

        sd = new Date(sd);
        ed = new Date(ed);
        range_duration = days_btw(sd, ed);

    }

    ssd = sd.toISOString().slice(0, 10).replace(/-/g, "-");
    sed = ed.toISOString().slice(0, 10).replace(/-/g, "-");



    ZOHO.CREATOR.init()
        .then(function (data) {


            let Room_Roster = {
                appName: "hms",
                reportName: "All_Room_Rosters",
                criteria: `((Occupancy_From >= "${ssd}" && Occupancy_To <= "${sed}") && (Class == "Active"))`
            },

            Room_Inventory = {
                appName: "hms",
                reportName: "room_inventory_Report",
                criteria: `(ID != 0)`
            };

            console.log(Room_Roster, "Room_Roster");

            ZOHO.CREATOR.API.getAllRecords(Room_Roster).then(function (response_roster) {
                //gettings all bookings
                console.log(response_roster);
                ZOHO.CREATOR.API.getAllRecords(Room_Inventory).then(function(response_inv){
                    //gettings all rooms

                    window.room_inventory = response_inv.data;

                    let __data = make_structure(data = response_roster.data, room_inventory = response_inv.data, sd = ssd, range_duration = range_duration)
                    load_gantt(__data);


                });

    
            });



        });
 




}


function isOverlapDetected(id){

    /* Function to disallow overlapped bookings on front end level
     */

    let taskParent = gantt.getParent(id);
    let siblings = gantt.getChildren(taskParent);
    let task  = gantt.getTask(id);
    let overlap = false;

    if (taskParent != "UN-ASSIGNED"){


        siblings.forEach((siblingId)=>{
            if(siblingId == id){
                return;
            }
    
            
            let sibling = gantt.getTask(siblingId);
            
            if(sibling.start_date.valueOf() <  task.end_date.valueOf()
             && sibling.end_date.valueOf() > task.start_date.valueOf()){
                overlap = true;
            }
    
            
        });
    

    }

    
    return overlap;
}

function updateBookingChange(){

    /* Function for creating trail and updated record 
     */
    console.log("eventAttached");
    gantt.attachEvent("onAfterTaskUpdate", function(id,item){
        
        console.log(window.terminal, "window.terminal")
        window.update_item = item;
        
        if(!window.terminal){

            if(window.gTaskUpdate){
                window.gTaskUpdate = false;
                
            } else {
                window.upd_Booking.show();
                
            }
        
        }
        console.log(window.gTaskUpdate, "UBC window.gTaskUpdate");
    


        
        
        console.log(window.update_item, "window.update_item");

        /* 
        if(window.upd_Booking.default == "1"){
    
            ZOHO.CREATOR.init()
                .then((data)=>{
                    
                    
                    
                    let Room_Roster_toTrail = {
                        appName: "hms",
                        reportName: "All_Room_Rosters",
                        id:item.zid
                    };


                    
                    ZOHO.CREATOR.API.getRecordById(Room_Roster_toTrail).then(function(trail_response){
                        
                        //getting the record for making a copy of it

                        let guest_list = [];

                        let date_store = JSON.parse(JSON.stringify({item_start_date_copy: item.start_date,
                                                                    item_end_date_copy: item.end_date}));

                            date_store.item_start_date_copy = new Date(date_store.item_start_date_copy);
                            date_store.item_end_date_copy = new Date(date_store.item_end_date_copy);

                        //To future me please don't abandon this logic, prevents task jump glitch
                        
                        trail_response.data.Guests.forEach((g_obj)=>{
                            guest_list.push(g_obj.ID);
                        });

    
                        let trail_response_data = trail_response.data,
                            Room_Roster_Active = {
                            appName: "hms",
                            formName: "Room_Roster",
                            data:{data:{
                                Guests:guest_list,
                                Booking_No: trail_response_data.Booking_No,
                                Reservation_Number: trail_response_data.Reservation_Number,
                                Rate:trail_response.Rate,
                                Occupancy_From: __ZOHO_dt(date_store.item_start_date_copy),
                                Adult:trail_response.Adult,
                                Class: "Active",
                                Occupancy_To:__ZOHO_dt(date_store.item_end_date_copy),
                                Room_No: trail_response_data.Room_No.ID,
                                Child:trail_response.Child
                            }}
                        }; //trail copy

                        let Room_Roster_Trailed = {
                            appName: "hms",
                            reportName: "All_Room_Rosters",
                            id:item.zid,
                            data:{data:{Class:"Trail"}}
                        }; //trailed

                        console.log(item.end_date, "end_date");
                        

                        ZOHO.CREATOR.API.updateRecord(Room_Roster_Trailed).then(function(response_updated){
                            //trail request

                            let general_reservation_record = {
                                appName: "hms",
                                reportName:"room_register_Report",
                                criteria:`(Registration_No == ${trail_response.data.Reservation_Number})`
                            };

                            
                            ZOHO.CREATOR.API.getAllRecords(general_reservation_record).then(function(response_general){

                                let genral_update_id = response_general.data[0].ID;
                                console.log(response_general);

                                let general_update_data = {
                                    appName: "hms",
                                    reportName:"room_register_Report",
                                    id:genral_update_id,
                                    data:{data:{
                                        Room_Check_Out:Room_Roster_Active.data.data.Occupancy_To,
                                        Room_Check_In:Room_Roster_Active.data.data.Occupancy_From
                                        }}

                                };



                                ZOHO.CREATOR.API.updateRecord(general_update_data).then(function(response_gen_upd){

                                    
                                    ZOHO.CREATOR.API.addRecord(Room_Roster_Active).then(function(response_added){
                                        //Active Request
            
                                        let gTask = gantt.getTask(item.id);
                                        gTask.zid = response_added.data.ID;
            
                                    }).catch((data)=>{console.log(data)});
            





                                }).catch((data)=>{

                                    console.log(data);
                                });



                            }).catch((data)=>{
                                
                                console.log(data);

                            });



                            

                        }).catch((data)=>{console.log(data)});


                        

                                                


                    });
                    
                    //alert(JSON.stringify(Room_Roster));
                    //add change alert modal


                    
            
                });

        } else {

            console.log("No Update", window.location);
            window.location = window.location.href;
            
        } */
        
        

    });

        
    
}

function disableBookingOverlap() {

    /* Frontend logic for disabling overlap bookings
        & hiding min duration tasks
     */

    
    gantt.attachEvent("onBeforeTaskChanged", (id, mode, task)=>{
        
        
        
        let overlap = isOverlapDetected(id);
        
        if(overlap){
            
            return false;

        } 

        console.log("detected");
        return true;
    });


    
}

function update_confirmation(){

    $(".upd_Booking").on("click", (e)=>{
        console.log("upd_Booking");
        let target = $(e.currentTarget);
        
        
        
        if(target.attr("val") == "1"){
    
            ZOHO.CREATOR.init()
                .then((data)=>{
                    
                    
                    
                    let Room_Roster_toTrail = {
                        appName: "hms",
                        reportName: "All_Room_Rosters",
                        id:window.update_item.zid
                    };
        
        
                    
                    ZOHO.CREATOR.API.getRecordById(Room_Roster_toTrail).then(function(trail_response){
                        
                        //getting the record for making a copy of it
        
                        let guest_list = [];
                        let room_zid = gantt.getLightboxSection('Room').getValue();
                        let updated_parent_id = ""; //startHere

                        gantt.getLightboxSection('Room').section.options.forEach((option_obj)=>{
                            if (option_obj.key == room_zid){
                                updated_parent_id = option_obj.label;
                            }
                        });

                        
                        
        
                        let date_store = JSON.parse(JSON.stringify({item_start_date_copy: window.update_item.start_date,
                                                                    item_end_date_copy: window.update_item.end_date}));
        
                            date_store.item_start_date_copy = new Date(date_store.item_start_date_copy);
                            date_store.item_end_date_copy = new Date(date_store.item_end_date_copy);
                            date_store.item_end_date_copy = date_store.item_end_date_copy.getHours() == 0 ? new Date(date_store.item_end_date_copy.setMinutes(date_store.item_end_date_copy.getMinutes() - 1)):date_store.item_end_date_copy
                            
        
                        //To future me please don't abandon this logic, prevents task jump glitch

                        if(trail_response.data.Guests != ""){
                        
                            trail_response.data.Guests.forEach((g_obj)=>{

                                guest_list.push(g_obj.ID);

                            });

                        }
        
                        
                        let trail_response_data = trail_response.data,
                            Room_Roster_Active = {
                            appName: "hms",
                            formName: "Room_Roster",
                            data:{data:{
                                Guests:guest_list,
                                Booking_No: trail_response_data.Booking_No,
                                Reservation_Number: trail_response_data.Reservation_Number,
                                Rate:trail_response.Rate,
                                Occupancy_From: __ZOHO_dt(date_store.item_start_date_copy),
                                Adult:trail_response.Adult,
                                Class: "Active",
                                Occupancy_To:__ZOHO_dt(date_store.item_end_date_copy),
                                Room_No:window.lightbox_save?room_zid:trail_response_data.Room_No.ID,
                                Child:trail_response.Child
                            }}
                        }; //trail copy

                        console.log(trail_response_data);

                        let Room_Roster_Trailed = {
                            appName: "hms",
                            reportName: "All_Room_Rosters",
                            id:window.update_item.zid,
                            data:{data:{Class:"Trail"}}
                        }; //trailed
                        
        
                        ZOHO.CREATOR.API.updateRecord(Room_Roster_Trailed).then(function(response_updated){
                            //trail request
        
                            let general_reservation_record = {
                                appName: "hms",
                                reportName:"room_register_Report",
                                criteria:`(Registration_No == ${trail_response.data.Reservation_Number})`
                            };
        
                            
                            ZOHO.CREATOR.API.getAllRecords(general_reservation_record).then(function(response_general){
        
                                let genral_update_id = response_general.data[0].ID;
                                console.log({data:{data:{
                                    Room_Check_Out:Room_Roster_Active.data.data.Occupancy_To,
                                    Room_Check_In:Room_Roster_Active.data.data.Occupancy_From,
                                    Room_No:window.lightbox_save?room_zid:trail_response_data.Room_No.ID
                                    }}}, "upadte_data");
        
                                let general_update_data = {
                                    appName: "hms",
                                    reportName:"room_register_Report",
                                    id:genral_update_id,
                                    data:{data:{
                                        Room_Check_Out:Room_Roster_Active.data.data.Occupancy_To,
                                        Room_Check_In:Room_Roster_Active.data.data.Occupancy_From,
                                        Room_No:window.lightbox_save?room_zid:trail_response_data.Room_No.ID
                                        }}
        
                                };
        
        
        
                                ZOHO.CREATOR.API.updateRecord(general_update_data).then(function(response_gen_upd){
                                    
                                    console.log(response_gen_upd, "response_gen_upd");
                                    
                                    ZOHO.CREATOR.API.addRecord(Room_Roster_Active).then(function(response_added){
                                        //Active Request
            
                                        let gTask = gantt.getTask(window.update_item.id);
                                        gTask.zid = response_added.data.ID;
                                        //console.log(updated_parent_id);
                                        window.gTaskUpdate = false;
                                        console.log(window.gTaskUpdate, "window.gTaskUpdate");
                                        console.log(window.lightbox_save, "window.lightbox_save");
                                        if (window.lightbox_save){
                                            gTask.parent = updated_parent_id;    
                                            gantt.addTask(gTask);
                                            window.lightbox_save = false;
                                        }
                                        
                                        
                                        
                                        //gantt.moveTask(gTask.id, 1, updated_parent_id);
                                        
            
                                    }).catch((data)=>{console.log(data)});
            
        
        
        
        
        
                                }).catch((data)=>{
        
                                    console.log(data);
                                });
        
        
        
                            }).catch((data)=>{
                                
                                console.log(data);
        
                            });
        
        
        
                            
        
                        }).catch((data)=>{console.log(data)});
        
        
                        
        
                                                
        
        
                    });
                    
                    //alert(JSON.stringify(Room_Roster));
                    //add change alert modal
        
        
                    
            
                });
        
            window.upd_Booking.hide();
            
        
        } else {
        
            //console.log("No Update", window.location);
            window.location = window.location.href;
            
        }
        

    });
    
}


function update_light_box_event(){

    gantt.attachEvent("onLightboxSave", function(id, task, is_new){
        
        window.lightbox_save = true;
        window.update_item = task;

        
        return true;
    
    });

}



$(() => {

    /* On-Load  initiated
     */

    window.loaded = false;
    window.terminal = false;
    window.date_magic = {};
    window.cell_color = {};
    window.gTaskUpdate = false;
    window.lightbox_save = false;
    window.upd_Booking = new bootstrap.Modal(document.getElementById('upd_Booking'), {
        keyboard: false
    })
    

    
    update_light_box_event();
    update_confirmation();
    fetch_data();
    disableBookingOverlap();    

    

    //var myWindow = window.open("https://www.w3schools.com", "_parent");


    $("#updateChart").on("click", () => {
        
        window.terminal = true;
        console.log(window.terminal);
        window.date_magic = {}; //to reset on dataUpdate
        window.cell_colors = {};
        gantt.clearAll();
        fetch_data();
       
    });

})