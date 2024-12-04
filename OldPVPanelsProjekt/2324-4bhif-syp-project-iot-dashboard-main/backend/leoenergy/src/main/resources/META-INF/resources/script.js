const selectedDate = document.getElementById("date");
const dropdown = document.getElementById("choices");

function submit() {
    const startDate = new Date(selectedDate.value);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    const endDate = new Date(selectedDate.value);
    startDate.setHours(23);
    startDate.setMinutes(59);
    startDate.setSeconds(59);
    const option = dropdown.value;
    makeAPICall(startDate.toISOString(), endDate.toISOString(), option);
}

function makeAPICall(startDate, endDate, value) {
    let apiUrl = `http://localhost:8080/energyproduction/getDataBetweenTwoTimestamps/${startDate}/${endDate}/${value}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            drawChart(convertJsonToMap(data));
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function drawChart(data) {
    const values = Array.from(data.values());
    const sum = values.reduce((acc, value) => acc + value, 0);
    const average = sum / values.length;
    const median = (values.sort((a, b) => a - b)[Math.floor(values.length / 2)] + values.sort((a, b) => a - b)[Math.ceil(values.length / 2 - 1)]) / 2;
    const max = Math.max(...values);

    const chart = new CanvasJS.Chart('chartContainer', {
        axisX: {
            valueFormatString: 'HH:mm',
            interval: 0.5,
            //labelAngle: -50,
            title: 'Time'
        },
        axisY: {
            title: 'W',
            stripLines: [{
                value: average,
                color: 'green',
                label: `average (${average})`,
                labelFontColor: 'green',
                labelAlign: 'near',
                labelBackgroundColor: 'white',
                labelFontSize: 10
            }, {
                value: median,
                color: 'blue',
                label: `median (${median})`,
                labelFontColor: 'blue',
                labelAlign: 'near',
                labelBackgroundColor: 'white',
                labelFontSize: 10
            }, {
                value: max,
                color: 'yellow',
                label: `max (${max})`,
                labelFontColor: 'yellow',
                labelAlign: 'near',
                labelBackgroundColor: 'white',
                labelFontSize: 10
            }]
        },
        data: [{
            type: 'spline',
            dataPoints: Array.from(data, ([date, value]) => ({
                x: date,
                y: value
            }))
        }]
    });
    chart.render();


}

function convertJsonToMap(jsonData) {
    const dateValueMap = new Map();
    var index = 0;

    for (const dateString in jsonData) {
        if (jsonData.hasOwnProperty(dateString)) {
            const value = jsonData[dateString];
            // Extract timestamp without fractional seconds and time zone offset
            const timestamp = dateString.replace(/(\.\d+)?Z\[UTC\]$/, '');
            if(value > 10)
                console.log(new Date(timestamp) + ": " + value);
            dateValueMap.set(new Date(timestamp), value);
            index++;
        }
    }
    let map = new Map(Array.from(dateValueMap.entries()).sort(([a], [b]) => a - b));
    //console.log(map);

    return  map
}