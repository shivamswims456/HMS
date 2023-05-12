window.parsed = false;

function days_btw(sd, end_date){

    //https://stackoverflow.com/a/2627493
    
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((sd - end_date) / oneDay));

    return diffDays

    

}

function make_structure_false(data, sd, range_duration){

    
    var display_list = [];

    $.each(data, (i, obj)=>{

        parent_present = [];
        let room_no = obj.Room_No.display_value;
        

        if (!parent_present.includes(room_no)){

            parent_entry = {"id":"Room #" + room_no,"text":"Room #" + room_no,
            "sd1":"2023-05-01 00:00:00",
            "sd":"2023-05-01 00:00:00",
            "type":"project",
            "render":"split","parent":"0",
            "progress":0,
            "open":false,
            "duration":range_duration};
            display_list.push(parent_entry);
        }

        let sd_booking = new Date(obj.Occupancy_From.split(" "));
            __end_date = new Date(obj.Occupancy_To.split(" "));
            booking_range = days_btw(sd, __end_date),
            string_date = sd_booking.toISOString().slice(0,10).replace(/-/g,"-");

            console.log();

        

        child_entry = {"id":obj.Reservation_Number,
                       "text":"Booking " + obj.Reservation_Number,
                       "start_date":"2023-05-01 00:00:00",
                       "duration":booking_range,
                       "parent":"Room #" + room_no,
                       "progress":0,
                       "open":true}
        
        
        display_list.push(child_entry);

    });

    
    
    console.log(display_list, "sssss");
    return display_list;

}


function make_structure(data, sd, range_duration){

    let display_list = [];
    let parent_present = [];

    for (const obs of data) {
        
        room_no = obs.Room_No.display_value;

        if (!parent_present.includes(room_no)){


        }

    }

}





function load_gantt(data){

    gantt.plugins({
        auto_scheduling: true
    });

    
    gantt.config.auto_types = true;
    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_compatibility = true;
    gantt.locale.labels.section_split = "Display";
    gantt.config.lightbox.project_sections = [
        {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
        {name: "split", type:"checkbox", map_to: "render", options:[
            {key:"split", label:"Split Task"}
        ]},
        {name: "time", type: "duration", readonly: true, map_to: "auto"}
    ];

    gantt.config.open_split_tasks = true;
    gantt.config.columns=[
        {name:"text",       label:"Task name",  tree:true, width:'120' },
        {name:"duration",   label:"Total Booking",   align: "center" },
        {name:"add",        label:"" }
];

    gantt.init("gantt_here");
    console.log(data);
    var demo_tasks = {
		data: [
			{id: 13, text: "Room #101", start_date: "30-03-2023 00:00", type: "project", render:"split", parent: "0", progress: 0, open: false, duration: 30},
				{id: 17, text: "Booking #1", start_date: "03-04-2023 00:00", duration: 1, parent: "13", progress: 0, open: true},
				{id: 18, text: "Booking #2", start_date: "05-04-2023 00:00", duration: 2, parent: "13", progress: 0, open: true},
				{id: 19, text: "Booking #3", start_date: "08-04-2023 00:00", duration: 1, parent: "13", progress: 0, open: true},
				{id: 20, text: "Booking #4", start_date: "10-04-2023 00:00", duration: 4, parent: "13", progress: 0, open: true},
				{id: 14, text: "Room #102", start_date: "02-04-2023 00:00", duration: 6, parent: "13", progress: 0, open: true},
			
      		{id: 15, text: "Room #103", type: "project", render:"split", parent: "0", progress: 0, open: false, start_date: "03-04-2023 00:00", duration: 30},
				{id: 21, text: "Booking #1", start_date: "03-04-2023 00:00", duration: 4, parent: "15", progress: 0, open: true},
				{id: 22, text: "Booking #2", start_date: "08-04-2023 00:00", duration: 3, parent: "15", progress: 0, open: true},

      		{id: 55, text: "Room #104", type: "project", render:"split", parent: "0", progress: 0, open: false, start_date: "03-04-2023 00:00", duration: 30},
				{id: 53, text: "Booking #1", start_date: "10-04-2023 00:00", duration: 4, parent: "55", progress: 0, open: true},
				{id: 54, text: "Booking #2", start_date: "15-04-2023 00:00", duration: 3, parent: "55", progress: 0, open: true},


      		{id: 93, text: "Room #105", start_date: "30-03-2023 00:00", type: "project", render:"split", parent: "0", progress: 0, open: false, duration: 30},
				{id: 97, text: "Booking #1", start_date: "08-04-2023 00:00", duration: 1, parent: "93", progress: 0, open: true},
				{id: 98, text: "Booking #2", start_date: "10-04-2023 00:00", duration: 2, parent: "93", progress: 0, open: true},
				{id: 99, text: "Booking #3", start_date: "13-04-2023 00:00", duration: 1, parent: "93", progress: 0, open: true},
				{id: 90, text: "Booking #4", start_date: "15-04-2023 00:00", duration: 4, parent: "93", progress: 0, open: true},
				{id: 94, text: "Room #102", start_date: "22-04-2023 00:00", duration: 6, parent: "93", progress: 0, open: true},


      		{id: 43, text: "Room #106", start_date: "30-03-2023 00:00", type: "project", render:"split", parent: "0", progress: 0, open: false, duration: 30},
				{id: 47, text: "Booking #1", start_date: "14-04-2023 00:00", duration: 1, parent: "43", progress: 0, open: true},
				{id: 48, text: "Booking #2", start_date: "17-04-2023 00:00", duration: 2, parent: "43", progress: 0, open: true},
				{id: 49, text: "Booking #3", start_date: "20-04-2023 00:00", duration: 1, parent: "43", progress: 0, open: true},
				{id: 40, text: "Booking #4", start_date: "24-04-2023 00:00", duration: 4, parent: "43", progress: 0, open: true},
				{id: 44, text: "Room #102", start_date: "26-04-2023 00:00", duration: 6, parent: "43", progress: 0, open: true},

      
		],
		links: [
			
		]
	};
	
	
    gantt.parse(demo_tasks);
    window.parsed = true;

}


function fetch_data(){

    let sd = $("#sd").val(),
        end_date = $("#end_date").val(),
        range_duration = days_btw(sd, end_date),
        date = new Date();

    if (sd == '' || end_date == ''){

        sd = new Date(date.getFullYear(), date.getMonth(), 1);
        end_date = new Date(date.getFullYear(), date.getMonth() + 1, 0),
        range_duration = days_btw(sd, end_date);

        sd = sd.toISOString().slice(0,10).replace(/-/g,"-");
        end_date = end_date.toISOString().slice(0,10).replace(/-/g,"-");
        

    }

    
        

    ZOHO.CREATOR.init()
        .then(function(data) {
        
        
            let __ = ZOHO.CREATOR.UTIL.getInitParams();
            let pageParams = ZOHO.CREATOR.UTIL.getQueryParams();
            
            Room_Roster = {
                appName : "hms",
                reportName : "All_Room_Rosters",
                criteria: `(Occupancy_From >= '${sd}' && Occupancy_To <= '${end_date}')`
            };

            

            ZOHO.CREATOR.API.getAllRecords(Room_Roster).then(function(response){
   
                console.log(make_structure(data = response.data, sd = sd, range_duration = range_duration));
/*                 let __data = make_structure(data = response.data, sd = sd, range_duration = range_duration)
            
                load_gantt(data = __data);
 */

            });
             
            
         
        });
    

}


$(()=>{

    fetch_data();
    
    $("#updateChart").on("click", ()=>{

        fetch_data();
    });

});




