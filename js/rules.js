/*-------------------------
 Functions for rules tab
 F. Bardin 05/03/2016
 -------------------------*/

//---------------------------------------
// Globals for rules details tab
//---------------------------------------
var nbcond, nbact; 			// number of rows for condition or action
var nextcondid, nextactid; 	// next id for condition or action
var selcond, selact; 		// selected row for condition or action
var tabdetail = "#"+getCurrentTabsID("#detail");
var rowmaxelem = 4;	// Max number of elements in a row

//=======================================
// Function for rules tab
//=======================================
function rulesTab(){
	scrollCurrentTab("#tabs");

	// Get selector for Div ID of current tab
	var tabrules = "#"+getCurrentTabsID("#tabs");

	// Trigger sensor selection
	$("#tabs td span.ui-icon input").click(function(){
		$(this).change();
	});
	// Select sensor rules when a new selection occurs
	$("#tabs input[type=radio][name=seradio]").change(function(){
		$("#tabs span.ui-icon-arrow-1-e").each(function(){
			$(this).removeClass("ui-icon-arrow-1-e");
			$(this).addClass("ui-icon-radio-off");
			$(this).parent("td").parent("tr").removeClass("ui-state-focus");
		});
		var cbspan = $(this).parent("span");
		cbspan.parent("td").parent("tr").addClass("ui-state-focus");
		cbspan.removeClass("ui-icon-radio-off");
		cbspan.addClass("ui-icon-arrow-1-e");
		// Load detail tab with sensor rules
		var sensorid = $(this).attr("id");
		$(tabdetail).load("details.php?rt=rules&sensor="+sensorid, function(){
			$("#detail").show("slide");
			scrollCurrentTab("#detail");
		});
	});
} // rulesTab

//=======================================
// Functions for rules details tab
//=======================================
//---------------------------------------
// Trigger row selection
// Select a row for conditions or actions acts as a radio button
// Row selection impacts button enable/disable
//---------------------------------------
function catchRowSelection(objectid){
	$(objectid).change(function() {
		var id=$(this).attr("id");
		var selClass=$(this).attr("class");
		var pref=selClass.substr(0,1); // get 'c' or 'a'
		var buttonList="#"+pref+"del";
		if (! $("#"+id).parent("span").hasClass("cbchecked")){ // if not checked, remove existing checked
			$(tabdetail+" tbody span.cbchecked input."+selClass).prop("checked",false);
			$(tabdetail+" tbody span.cbchecked input."+selClass).parent("span").removeClass("cbchecked");
			// The current row is checked --> Enable buttons
			$(buttonList).button("option", "disabled", false);

			// Stored clicked row and disable up/down button if needed
			var selrow = $(this).parent("span").parent("td").parent("tr").index();
			var tableid;
			if (pref == "c"){
				selcond = selrow;
				tableid = "condtable";
			} else {
				selact  = selrow;
				tableid = "acttable";
			}
			updateUpDownState(tableid);

		} else { // The current row is unchecked --> disable buttons
			buttonList="#"+pref+"mvup, #"+pref+"mvdn, "+buttonList;
			$(buttonList).button("option", "disabled", true);
			if (pref == "c"){selcond = "";}
			else			{selact  = "";}
		}
		$("#"+id).parent("span").toggleClass("cbchecked");
	});
} // catchRowSelection

//---------------------------------------
// Trigger operator change
//---------------------------------------
function catchSelopeChange(objectid){
	$(objectid).on("selectmenuchange", function (event,val) {
		var condnum = $(this).attr("id").substr(7); // id = "sbcond_"+cond
		var valope = $(this).val();
		var valid = "cval"+condnum;
		if (valope == "dx"){$("#"+valid).hide();}
		else               {$("#"+valid).show();}
	});
} // catchSelopeChange

//--------------------------------------------------
// Set the state (enable/disable) of the tables buttons
// These buttons are : up, down, delete, add
//--------------------------------------------------
function setButtonsState(){
	// Table conditions buttons
	if (nbcond == 1){
		$(tabdetail+" tbody input.csel").hide(0);
		$("#cmvup, #cmvdn, #cdel").button("option", "disabled", true);
	} else {
		$(tabdetail+" tbody input.csel").filter(":first").show(0);
	}
	if (nbcond == rowmaxelem)	{$("#cadd").button("option", "disabled", true);}
	else						{$("#cadd").button("option", "disabled", false);}

	// Table actions buttons
	if (nbact == 1){
		$(tabdetail+" tbody input.asel").hide(0);
		$("#amvup, #amvdn, #adel").button("option", "disabled", true);
	} else {
		$(tabdetail+" tbody input.asel").filter(":first").show(0);
	}
	if (nbact == rowmaxelem){$("#aadd").button("option", "disabled", true);}
	else					{$("#aadd").button("option", "disabled", false);}
} // setButtonsState

//----------------------------------------------------------
// Update up and down button depending on the selected row
// parameter : tableid = id of table buttons
//----------------------------------------------------------
function updateUpDownState(tableid){
	var selrow, nbrow, pref;
	// Init values
	if (tableid == "condtable"){
		selrow = selcond;
		nbrow = nbcond;
		pref = "c";
	} else {
		selrow = selact;
		nbrow = nbact;
		pref = "a";
	}
	if (selrow == 1){				// if 1st row : disable up button
		$("#"+pref+"mvup").button("option","disabled", true);
		if (nbrow > 1){
			$("#"+pref+"mvdn").button("option","disabled", false);
		}
	} else {
		$("#"+pref+"mvup").button("option","disabled", false);
		if (selrow == nbrow){	// if last row : disable down button
			$("#"+pref+"mvdn").button("option","disabled", true);
		} else {
			$("#"+pref+"mvdn").button("option","disabled", false);
		}
	}
} // updateUpDownState

//---------------------------------------
// Initialize the rows count with displayed rule
//---------------------------------------
function InitRowsCount(){
	nbcond = $(tabdetail+" tbody input.csel").length;
	nbact = $(tabdetail+" tbody input.asel").length;
	nextcondid = nbcond;
	nextactid = nbact;
	setButtonsState();
} // InitRowsCount

//---------------------------------------
// Function for 'sensor' rules detail tab
//---------------------------------------
function sensorRulesDetail(){
	InitRowsCount();	

	// Trigger rule display on selection
	$("#srsel").on("selectmenuchange", function (event,val) {
		var sensorid = $("#sensorid").val();
		var ruleid = $(this).val();
		$(tabdetail).load("details.php?rt=rules&nh=&sensor="+sensorid+"&rule="+ruleid, function(){
			scrollCurrentTab("#detail");
		});
		// re-Initialize rows counters and buttons
		InitRowsCount();	
	});

	// Trigger row selection and operator change
	$(tabdetail+" tbody input.csel,"+tabdetail+" tbody input.asel").each(function(){
		catchRowSelection(this);
	});
	$(tabdetail+" .selope").each(function(){
		catchSelopeChange(this);
	});

	// Manage buttons trigger for tables
	$("#cmvup").click(function(){mvUpSelectedDetail("condtable");});
	$("#cmvdn").click(function(){mvDownSelectedDetail("condtable");});
	$("#cdel").click(function(){delSelectedDetail("condtable");});
	$("#cadd").click(function(){addCond();});
	$("#amvup").click(function(){mvUpSelectedDetail("acttable");});
	$("#amvdn").click(function(){mvDownSelectedDetail("acttable");});
	$("#adel").click(function(){delSelectedDetail("acttable");});
	$("#aadd").click(function(){addAct();});

	// Manage update of rule
	$("#rupd").click(function(){updateRule();});
	$("#rdel").click(function(){deleteRule();});
} // sensorRulesDetail

//-----------------------------------------------------
// Move up a table row
// parameter :
// - tableid = id the table where the row is to move up
//-----------------------------------------------------
function mvUpSelectedDetail(tableid){
	var rowcontent = $("#"+tableid+" tbody span.cbchecked").parent("TD").parent("TR").detach();
	var rowindex;
	if (tableid == "condtable")	{
		rowindex = selcond - 1;
		selcond--;
	} else {
		rowindex = selact  - 1;
		selact--;
	}
	$("#"+tableid+" tr").eq(rowindex).before(rowcontent);
	updateUpDownState(tableid);
} // mvUpSelectedDetail

//-----------------------------------------------------
// Move down a table row
// parameter :
// - tableid = id the table where the row is to move down
//-----------------------------------------------------
function mvDownSelectedDetail(tableid){
	var rowcontent = $("#"+tableid+" tbody span.cbchecked").parent("TD").parent("TR").detach();
	var rowindex;
	if (tableid == "condtable")	{
		rowindex = selcond;
		selcond++;
	} else {
		rowindex = selact;
		selact++;
	}
	$("#"+tableid+" tr").eq(rowindex).after(rowcontent);
	updateUpDownState(tableid);
} // mvDownSelectedDetail

//-----------------------------------------------------
// Delete selected row
// parameters :
// - tableid = id the table where the row is to delete
//-----------------------------------------------------
function delSelectedDetail(tableid){
	$("#"+tableid+" tbody span.cbchecked").parent("TD").parent("TR").each(function(){
		$(this).remove();
		var pref;
		if (tableid == "condtable"){
			nbcond--;
			pref = "c";
		} else {
			nbact--;
			pref = "a";
		}
		// Row deleted = no selection --> disable buttions
		var buttonList="#"+pref+"mvup, #"+pref+"mvdn, #"+pref+"del";
		$(buttonList).button("option", "disabled", true);
		setButtonsState();
	});	
} // delSelectedDetail

//-----------------------------------------------------
// Add new condition row
//-----------------------------------------------------
function addCond(){
	var sensorid = $("#sensorid").val();
	$("#condtable").append("<TR></TR>");
	$("#condtable tr:last").load('main.php?rt=addcond&sensorid='+sensorid+'&cond='+nextcondid, function(){
		$("#condcb_"+nextcondid).each(function(){catchRowSelection(this);});
		$("#sbcond_"+nextcondid).each(function(){catchSelopeChange(this);});
		nbcond++;
		nextcondid++;
		setButtonsState();
	});
} // addCond

//-----------------------------------------------------
// Add new action row
//-----------------------------------------------------
function addAct(){
	$("#acttable").append('<TR></TR>');
	$("#acttable tr:last").load('main.php?rt=addact&act='+nextactid, function(){
		$("#actcb_"+nextactid).each(function(){catchRowSelection(this);});
		nbact++;
		nextactid++;
		setButtonsState();
	});
} // addAct

//-----------------------------------------------------
// Update rule with current display
//-----------------------------------------------------
function updateRule(){
	// Get values
	var sensorid = $("#sensorid").val();
	var ruleid = $("#srsel").val();
	var rule_name = $("#rulename").val();
	var rule_status = $("#srradio [name=srradio]:checked").val();

	// Get conditions
	var tdnum;
	var cond,address,operator,value;
	cond = "";
	$("#condtable tr").each(function(){
		address = "";
		tdnum = 0;
		$(this).find("td").each(function(){
			tdnum++;
			switch(tdnum){
				case 1 : // Check box = ignored
					break;
				case 2 : // Sensor address
					address = $(this).find("input").val();
					break;
				case 3 : // Operator
					operator = $(this).find("select").val();
					break;
				case 4 : // Value
					value = $(this).find("input").val();
					break;
			}
		});
		if (address != "" && operator != ""){
			if (cond != ""){cond += ",";}
			cond += '{"address":"/sensors/'+sensorid+'/'+address+'","operator":"'+operator+'"';
			if (operator != "dx"){
				cond += ',"value":"'+value+'"';
			}
			cond += '}';
		}
	});
	
	// Get actions
	var act,method,body;
	act = "";
	$("#acttable tr").each(function(){
		address = "";
		tdnum = 0;
		$(this).find("td").each(function(){
			tdnum++;
			switch(tdnum){
				case 1 : // Check box = ignored
					break;
				case 2 : // Action address
					address = $(this).find("input").val();
					break;
				case 3 : // Method
					method = $(this).find("select").val();
					break;
				case 4 : // Json body send as action
					body = $(this).find("input").val();
					break;
			}
		});
		if (address != "" && method != ""){
			if (act != ""){act += ",";}
			act += '{"address":"'+address+'","method":"'+method+'"';
			act += ',"body":{'+body+'}';
			act += '}';
		}
	});
	
	// Create json string only if condition and action exist
	if (cond != "" && act != ""){
		var cmdjs = "&cmdjs={";
		cmdjs += '"name":"'+rule_name+'","status":"'+rule_status+'",';
		cmdjs += '"conditions":['+cond+'],';
		cmdjs += '"actions":['+act+']';
		cmdjs += "}";

		// Send request
		var action = "rules";
		var method = "&method="; // Create by default
		if (ruleid == "0"){ // Create
			method += "POST";
		} else { 			// Update
			action += "/"+ruleid;
			method += "PUT";
		}

		$.getJSON('hueapi_cmd.php?action='+action+cmdjs+method, (function(jsmsg){
			if (processReturnMsg(jsmsg)){
				var successMsg;
				if (ruleid == "0"){
					ruleid = jsmsg[0].success.id;
					successMsg = trs.Created;
				} else {
					successMsg = trs.Updated;
				}
				msg(trs.Rule+' '+ruleid+' "'+rule_name+'" '+successMsg);

				// re-display tab
				$(tabdetail).load("details.php?rt=rules&nh=&sensor="+sensorid+"&rule="+ruleid, function(){
					scrollCurrentTab("#detail");
				});
				// re-Initialize rows counters and buttons
				InitRowsCount();	
			} 
		}));
	}
} // updateRule

//-----------------------------------------------------
// Update rule with current display
//-----------------------------------------------------
function deleteRule(){
	var ruleid = $("#srsel").val();
	var action = "rules/"+ruleid;
	var method = "&method=DELETE";

	// Confirmation required before delete
	// TODO add text localisation in dialog
    $("#deldialog").dialog({
	  title : "Delete selected rule",
      resizable: false,
      modal: true,
      buttons: {
        "Delete": function() {
		  $.getJSON('hueapi_cmd.php?action='+action+method, (function(jsmsg){
			if (processReturnMsg(jsmsg,trs.Rule+' '+trs.Deleted)){
				var sensorid = $("#sensorid").val();
				$(tabdetail).load("details.php?rt=rules&nh=&sensor="+sensorid, function(){
					scrollCurrentTab("#detail");
				});
			}
		  }));
          $(this).dialog("close");
        },
        Cancel: function() {
          $(this).dialog("close");
        }
      }
	});


} // deleteRule

