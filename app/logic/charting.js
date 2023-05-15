function days_btw(sd, ed) {

    //https://stackoverflow.com/a/2627493

    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((sd - ed) / oneDay)) + 1;

    return diffDays


}

function load_gantt(load_data) {

    gantt.plugins({
        auto_scheduling: true
    });


    gantt.config.auto_types = true;
    //gantt.config.drag_resize = false;
    //gantt.config.drag_links = false;
    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_compatibility = true;
    gantt.locale.labels.section_split = "Display";
    gantt.config.lightbox.project_sections = [
        { name: "description", height: 70, map_to: "text", type: "textarea", focus: true },
        {
            name: "split", type: "checkbox", map_to: "render", options: [
                { key: "split", label: "Split Task" }
            ]
        },
        { name: "time", type: "duration", readonly: true, map_to: "auto" }
    ];

    gantt.config.open_split_tasks = true;
    gantt.config.columns = [
        { name: "text", label: "Task name", tree: true, width: '120' },
        { name: "duration", label: "Total Booking", align: "center" },
        { name: "add", label: "" }
    ];

    gantt.init("gantt_here");
    console.log(load_data, "data_loaded");

    gantt.parse({ "data": load_data, "links": [] });
    if (!window.loaded){

        updateBookingChange();
        window.loaded = true;

    }
    

    window.parsed = true;
}


function make_structure(data, room_inventory, sd, range_duration) {

    display_list = [];
    //parent_list = [];

    //console.log(data);

    room_inventory.forEach((room)=>{
        
        let room_no = room.Room_No;
         

        let lsd = sd.split("-"),
        psd = `${lsd[2]}-${lsd[1]}-${lsd[0]} 00:00`;

        
        display_list.push({
            id: room_no, text: "Room #" + room_no, start_date: psd,
            type: "project", render: "split", parent: "0", progress: 0,
            open: false, duration: 0, zid:room.ID
        });
    

    });

     
    

    

    data.forEach(booking => {
        let room_no = booking.Room_No.display_value;


        let ssd = new Date(booking.Occupancy_From)
        let eed = new Date(booking.Occupancy_To)
        let daysBtw = days_btw(eed, ssd);
        let bof = ssd.toISOString().slice(0, 10).replace(/-/g, "-").split("-");

        let sbof = `${bof[2]}-${bof[1]}-${bof[0]} 00:00`;
        //console.log(booking.Occupancy_From, booking.Reservation_Number);

        display_list.push({
            id: booking.Reservation_Number, text: `Booking #${booking.Reservation_Number}  (${booking.Guests.display_value})`,
            start_date: sbof,
            duration: daysBtw, parent: room_no, progress: 0, open: true, zid:booking.ID
        });


    });




    return display_list;

}

function fetch_data() {

    var sd = $("#sd").val(),
        ed = $("#ed").val(),
        date = new Date();

    //console.log(sd == '' || ed == '' || sd == null || ed == null);


    if (sd == '' || ed == '' || sd == null || ed == null) {

        sd = new Date(date.getFullYear(), date.getMonth(), 2);
        ed = new Date(date.getFullYear(), date.getMonth() + 1, 2),
            range_duration = days_btw(sd, ed);


    } else {

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
                criteria: `((Occupancy_From >= '${ssd}' || Occupancy_To <= '${sed}') && (Class == "Active"))`
            },

            Room_Inventory = {
                appName: "hms",
                reportName: "room_inventory_Report",
                criteria: `(ID != 0)`
            };

            //console.log(Room_Roster);

            ZOHO.CREATOR.API.getAllRecords(Room_Roster).then(function (response_roster) {
    
                ZOHO.CREATOR.API.getAllRecords(Room_Inventory).then(function(response_inv){
                    
                    let __data = make_structure(data = response_roster.data, room_inventory = response_inv.data, sd = ssd, range_duration = range_duration)
                    load_gantt(__data);


                });

    
            });



        });





}


function isOverlapDetected(id){

    let siblings = gantt.getChildren(gantt.getParent(id));
    let task  = gantt.getTask(id);
    let overlap = false;

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

    return overlap;
}

function __ZOHO_dt(__date){

    let toUTC = __date.toUTCString(),
        f_split = toUTC.split(", ")[1].split(" GMT")[0].split(" ");
        z_dt = `${f_split.slice('',3).join("-")} ${f_split[3].split(":").slice("", 2).join(":")}`;
        
    return z_dt;
    
}

function updateBookingChange(){


    gantt.attachEvent("onAfterTaskUpdate", function(id,item){
        
        console.log(!window.loaded, "windowStatus");
        

            ZOHO.CREATOR.init()
                .then((data)=>{
                    console.log(item);
                    
                    
                    let Room_Roster_toTrail = {
                        appName: "hms",
                        reportName: "All_Room_Rosters",
                        id:item.zid
                    };


                    
                    ZOHO.CREATOR.API.getRecordById(Room_Roster_toTrail).then(function(trail_response){
                    
                        
                        let trail_response_data = trail_response.data,
                            Room_Roster_Active = {
                            appName: "hms",
                            formName: "Room_Roster",
                            data:{data:{
                                Guests:trail_response_data.Guests.ID,
                                Booking_No: trail_response_data.Booking_No,
                                Reservation_Number: trail_response_data.Reservation_Number,
                                Occupancy_From: __ZOHO_dt(item.start_date),
                                Class: "Active",
                                Occupancy_To:__ZOHO_dt(item.end_date),
                                Room_No: trail_response_data.Room_No.ID
                            }}
                        },

                        Room_Roster_Trailed = {
                            appName: "hms",
                            reportName: "All_Room_Rosters",
                            id:item.zid,
                            data:{data:{Class:"Trail"}}
                        };

                        console.log(Room_Roster_Active);


                        ZOHO.CREATOR.API.updateRecord(Room_Roster_Trailed).then(function(response){
                            console.log(response);
                        }).catch((data)=>{console.log(data)});

                        ZOHO.CREATOR.API.addRecord(Room_Roster_Active).then(function(response){
                            console.log(response);
                        }).catch((data)=>{console.log(data)});




                    });
                    
                    //alert(JSON.stringify(Room_Roster));

        /*          ZOHO.CREATOR.API.updateRecord(Room_Roster).then(function(response){
                        console.log(response);
                    }).catch((data)=>{console.log(data)});
        */
                    
          
          
                });
            
            
        
        


    });

        
    
}

function disableBookingOverlap() {

    gantt.attachEvent("onBeforeTaskChanged", (id, mode, task)=>{

        
        let overlap = isOverlapDetected(id);
        
        if(overlap){
            
            return false;

        } 
        return true;
    });


    gantt.attachEvent

    gantt.templates.task_class = (start, end, task)=>{

        let css = "",
            state = gantt.getState();

            if(state.drag_id == task.id  && state.drag_mode == "move"){

                if(isOverlapDetected(task.id)){
                    css += "overlapped-task";
                }
            }

            

        return css;
    }

}

function addBookingEvent(){

    

}

$(() => {

    window.loaded = false;

    fetch_data();
    disableBookingOverlap();
    
    addBookingEvent();


    $("#updateChart").on("click", () => {

        gantt.clearAll();
        fetch_data();
    });

})