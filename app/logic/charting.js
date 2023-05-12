function days_btw(sd, ed){

    //https://stackoverflow.com/a/2627493
    
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((sd - ed) / oneDay));

    return diffDays


}

function load_gantt(load_data){

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
	console.log(load_data, "load_data");
	gantt.parse({"data":load_data, "links":[]});
}


function make_structure(data, sd, range_duration){

  display_list = [];
  parent_list = [];

  console.log(data);

  data.forEach(booking => {
      let room_no = booking.Room_No.display_value;

      
      let ssd = new Date(booking.Occupancy_From)
      let eed = new Date(booking.Occupancy_To)
      let daysBtw = days_btw(eed, ssd);
      let bof = ssd.toISOString().slice(0,10).replace(/-/g,"-").split("-");
      
      let sbof = `${bof[2]}-${bof[1]}-${bof[0]} 00:00`;
      console.log(booking.Occupancy_From, booking.Reservation_Number);
      
      display_list.push({id: booking.Reservation_Number, text: `Booking #${booking.Reservation_Number}  (${booking.Guests.display_value})`,
                         start_date: sbof,
                         duration: daysBtw, parent: room_no, progress: 0, open: true});
                        


      
      if (!parent_list.includes(room_no)){
        
        let lsd = sd.split("-"),
            psd = `${lsd[2]}-${lsd[1]}-${lsd[0]} 00:00`;
        
        parent_list.push(room_no);
        display_list.push({id: room_no, text: "Room #" + room_no, start_date: psd,
                           type: "project", render:"split", parent: "0", progress: 0,
                           open: false, duration: range_duration});

      }





      
  });

  return display_list;
  
}

function fetch_data(){

    var sd = $("#sd").val(),
        ed = $("#ed").val(),
        range_duration = days_btw(sd, ed),
        date = new Date();

    if (sd == '' || ed == '' || sd == null || ed == null){
        
        sd = new Date(date.getFullYear(), date.getMonth(), 2);
        ed = new Date(date.getFullYear(), date.getMonth() + 1, 2),
        range_duration = days_btw(sd, ed);
        
        ssd = sd.toISOString().slice(0,10).replace(/-/g,"-");
        console.log(sd, "")
        sed = ed.toISOString().slice(0,10).replace(/-/g,"-");
        console.log(ed)
        
    }


    ZOHO.CREATOR.init()
        .then(function(data) {
        
        
            let __ = ZOHO.CREATOR.UTIL.getInitParams();
            let pageParams = ZOHO.CREATOR.UTIL.getQueryParams();
            
            Room_Roster = {
                appName : "hms",
                reportName : "All_Room_Rosters",
                criteria: `(Occupancy_From >= '${ssd}' && Occupancy_To <= '${sed}')`
            };

            console.log(Room_Roster);
            
            ZOHO.CREATOR.API.getAllRecords(Room_Roster).then(function(response){
   

                let __data = make_structure(data = response.data, sd = ssd, range_duration = range_duration)
                load_gantt(__data);
                
 

            });
            
            

            
         
        });
    

    
    

}




$(()=>{

    fetch_data();
    
    $("#updateChart").on("click", ()=>{

        fetch_data();
    });  

})