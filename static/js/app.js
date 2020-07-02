var locations = [d3.select("#selDataset")]
var demographicInfo = d3.select("#sample-metadata")
var gaugeChart = d3.select("#gauge")
var bellyData
var patient


function createFilter(data, locations) {
    //Entering a blank first value
    locations[0].append("option")
    .text('')
    .attr("value",null)
    //Using data(array) to populate the location(array) of the filter
    for (var i = 0; i < locations.length; i++) {
        data[i].forEach((point) => {
            locations[i].append("option")
                .text(point)
                .attr("value", point)
        });
    };

};   

//function to retrieve the subject
function getSubject(subjectID){
    //dummy subject if the blank option is selected
    var subject = [{
        id: null,
        ethnicity: null,
        gender: null,
        age: null,
        location: null,
        bbtype: null,
        wfreq: null
    }]

    if (subjectID != ''){
        //filter for the subject data based on the subject id passed from the filter
        var subject = (bellyData['metadata'].filter(id => id.id == subjectID))
    };
    return subject
};

//function to populate the demographics div
function popDemo(patient,demoTag){
    //clearing the html out of the div
    demoTag.html("")
    //looping through the patient info passed to the function
    patient.forEach((point) =>{
        //iterating through the object
        for([key,value] of Object.entries(point)){
            //appending to the demographics tag
            demoTag.append("p")
            .text(`${key}: ${value}`)
        };
    });
};

//function to create the bar chart
function createBarChart(patient){
    //initial values
    var sample_values = []
    var otu_ids = []
    var otu_labels = []
    
    //since the patient is an array of objects we check whether patient[0] is null
    if (patient[0].id != null){
        //retrieve patient data based on the patient id
        var patientData = bellyData.samples.filter(subject => subject.id == patient[0].id)
        //loop through and grab the top 10 sample values or less (whichever is less), their otu ids and labels and append them to the corresponding lists
        //that were initialized in the beginning of the function
        for(i = 0; i < Math.min(10,(patientData[0]["sample_values"].length)); i++){
            sample_values.push(patientData[0]["sample_values"][i])
            otu_ids.push(`OTU ${patientData[0]["otu_ids"][i]}`)
            otu_labels.push(patientData[0]["otu_labels"][i])
        }
    }

    //creating a trace for plotly
    var trace = {
        x: sample_values,
        y: otu_ids,
        type: "bar",
        orientation:"h",
        mode: 'markers',
        marker: {size:8},
        text: otu_labels
    };
    
    var data = [trace]

    //layout information for plotly
    var layout = {
        title: "Sample of top 10 OTUs",
        xaxis: {title: "Sample Value"},
        yaxis: {titke: "OTU ID"}
    }
      
    //Plotting the data  
    Plotly.newPlot("bar", data, layout);
}

//function to create the bubble chart
function createBubbleChart(patient){
    var sample_values = []
    var otu_ids = []
    var otu_labels = []

    //since the patient is an array of objects we check whether patient[0] is null
    if (patient[0].id != null){
        //retrieve patient data based on the patient id
        var patientData = bellyData.samples.filter(subject => subject.id == patient[0].id)
        for(i = 0; i < (patientData[0]["sample_values"].length); i++){
            sample_values.push(patientData[0]["sample_values"][i])
            otu_ids.push(patientData[0]["otu_ids"][i])
            otu_labels.push(patientData[0]["otu_labels"][i])
        }
    }
    
    var trace = {
        x: otu_ids,
        y: sample_values,
        mode: 'markers',
        text: otu_labels,
        marker: {
            color:  otu_ids,
          size: sample_values
        }
        
      };
    var data = [trace]

    var layout = {
        title: `Samples of All OTUs for Subject: ${patient[0].id}`,
        xaxis: {title: "OTU ID"},
        yaxis: {titke: "Sample Values"}
    }

    Plotly.newPlot('bubble', data, layout);
}

function createGauge(patient){
    var data = [
        {
          domain: { x: [0, 1], y: [0, 1] },
          value: patient[0].wfreq,
          title: { text: "Belly Button Wash Frequency per week" },
          type: "indicator",
          mode: "gauge+number",
          gauge: {
            axis: { range: [0, 9] },
            steps: [
                { range: [0, 3], color: "rgba(31,119,160,0.3)" },
                { range: [3, 6], color: "rgba(31,119,180,0.5)" },
                { range: [6, 9], color: "rgba(31,119,200,0.7)" }
            ],
          }
        }
      ];
      
      var layout = {margin: { t: 0, b: 0 } };
      Plotly.newPlot('gauge', data, layout);
}

    //loading the data us d3
d3.json("samples.json").then((data)=> {
    // assigning the data to bellyData to make it globally accessible within this script
    bellyData = data
    //creating an instance of names of the subjects/patients
    var subjectNames = [bellyData['names']]
    //creating a filter for the subjecs/patients as part of the initial loading
    createFilter(subjectNames, locations)
});

function optionChanged(subjectID){
    patient = getSubject(subjectID)
    popDemo(patient,demographicInfo)
    createBarChart(patient)
    createBubbleChart(patient)
    createGauge(patient)
};
