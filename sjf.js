const arrivalTimesInput = document.querySelectorAll(".arrival-time");
const burstTimesInput = document.querySelectorAll(".burst-time");
const simulateBtn = document.getElementById("simulate-btn");
const closeBtn = document.getElementById("close-btn");

const timer = document.getElementById("timer-clock");
const chart = document.getElementById("gant-chart");
const timeLine = document.getElementById("time-line");

const overlay = document.getElementById("overlay");

const simulationWindow = document.getElementById("simulation-window");

const resultsTable = document.getElementById("results-table");
const finalGanttChart = document.getElementById("gantt-chart-after");
const finalTimeLine = document.getElementById("time-line-after");

simulateBtn.addEventListener("click", initialise);
closeBtn.addEventListener("click", function(){
    document.getElementById("final-head").classList.remove("hide");
    document.getElementById("final-table").classList.remove("hide");
    finalTimeLine.classList.remove("hide");
    finalGanttChart.classList.remove("hide");

    const dummyGantChart = chart.cloneNode(true);
    dummyGantChart.removeAttribute("id");
    dummyGantChart.classList.add("gant-chart");
    finalGanttChart.replaceChildren();
    finalGanttChart.appendChild(dummyGantChart);

    const dummyTimeLine = timeLine.cloneNode(true);
    dummyTimeLine.removeAttribute("id");
    dummyTimeLine.classList.add("time-line");
    finalTimeLine.replaceChildren();
    finalTimeLine.appendChild(dummyTimeLine);

    overlay.classList.add("hide");
    simulationWindow.classList.add("hide");
    simulationWindow.classList.add("sim-win-after");
});

// initialise();

function initialise() {

    document.getElementById("final-head").classList.add("hide");
    document.getElementById("final-table").classList.add("hide");
    finalTimeLine.classList.add("hide");
    finalGanttChart.classList.add("hide");

    // Firstly We create the arrays for storing AT, BT
    let arrivalTime =[0, 0, 0, 0, 0];
    let burstTime =[0, 0, 0, 0, 0];
    let finished =[0, 0, 0, 0, 0];

    // clear the previous gantt chart if any existed
    chart.replaceChildren(); //clears previous gantt chart
    timeLine.replaceChildren(); //clears previous timeline


    takeInput(arrivalTime, burstTime);
    
    let completionTime = [0, 0, 0, 0, 0];
    
    // Clock goes from 1 to end
    let finalItems = []; // for storing final sequence of processes, acc to clock

    sjf(arrivalTime, burstTime, finished, completionTime, finalItems);
    
    printgantchart(burstTime, completionTime, finalItems, arrivalTime);
}    
function takeInput(arrivalTime, burstTime){
    for(let i=0; i<5; i++){
        arrivalTime[i] = Number(arrivalTimesInput[i].children[0].value);   
        burstTime[i] =  Number(burstTimesInput[i].children[0].value);   
    }
}

function sjf(arrivalTime, burstTime, finished, completionTime, finalItems){
    let totalProcess = 0;
    let clock = 0;
    while(true){ // Loop has to go on until the processes are completed
        let minBurstTime = 1000; // no process can have burst time larger or equal to this
        let currProcess = 6; // cos we only have 5 processes
        if(totalProcess == 5){
            break; // i.e all processes are completed
        }
        
        for(let i=0; i<5; i++){
            if(arrivalTime[i] <= clock && finished[i] == 0 && burstTime[i] < minBurstTime){
                currProcess = i;
                minBurstTime = burstTime[i];
            }
        }
        // If C == N, means C value can not updated because no process arrivalTime < currentClockTime so we increase the clock time
        if(currProcess == 6){
            clock++;
        }
        else{
            // we got a process where some processes arrived and its burst time is minimum off all the arrived proecesses
            let thisProcess = [];
            thisProcess.push(currProcess);
            thisProcess.push(clock);
            finalItems.push(thisProcess); //currProcess which is going on will be queued to our final list
            completionTime[currProcess] = clock + burstTime[currProcess];
            clock += burstTime[currProcess];
            finished[currProcess] = 1;
            totalProcess++; // one process is completed
        }
    }
}


function printgantchart(burstTime, completionTime, finalItems, arrivalTime){
    
    overlay.classList.remove("hide");
    simulationWindow.classList.remove("hide");
    
    // all the processes would be completed in maxCompletionTime seconds
    let maxCompletionTime = -1;
    for(let i=0; i<5; i++){
        maxCompletionTime = Math.max(maxCompletionTime , completionTime[i]);
    }
    const widthPerSec = Math.floor(700 / maxCompletionTime);
    const secWidthString = "" + widthPerSec + "px";
    // make the timeLine for gantt chart

    if(finalItems[0][1] != 0){
        let idleWidth = finalItems[0][1] * (widthPerSec);
        let idleWidthString = "" + idleWidth + "px";
        const idleProcess = document.createElement("div");
        const idleName = document.createElement("p");

        idleProcess.classList.add("dummy-div");
        idleProcess.style.width = idleWidthString;
        idleProcess.style.textAlign = "center";
        chart.appendChild(idleProcess);

        idleName.innerHTML = "Idle";
        idleName.style.color = "white";
        idleProcess.appendChild(idleName);
    }
  
    let time = 0, index = 0;
    let timeline = setInterval(function(){
        if(index >= 5) clearInterval(timeline); // All the processes are executed

        if(finalItems[index][1] == time){
            if(index > 0 && completionTime[finalItems[index - 1][0]] != time){
                let dummyWidth = (widthPerSec * (time - completionTime[finalItems[index - 1][0]]));
                let dummyWidthString = "" + dummyWidth + "px";
                const dummyProcess = document.createElement("div");
                const dummyName = document.createElement("p");

                dummyProcess.classList.add("dummy-div");
                dummyProcess.style.width = dummyWidthString;
                dummyProcess.style.textAlign = "center";
                chart.appendChild(dummyProcess);

                dummyName.innerHTML = "Idle";
                dummyName.style.color = "white";
                dummyProcess.appendChild(dummyName);
            }

            const newProcess = document.createElement("div");
            const processName = document.createElement("h2");

            newProcess.classList.add("child-div");
            let newWidth = (widthPerSec * (burstTime[finalItems[index][0]]));
            let widthString = "" + newWidth + "px"; // width = "W px"
            newProcess.style.width = widthString;
            chart.appendChild(newProcess);

            processName.innerHTML = finalItems[index][0];
            processName.style.color = "white";
            newProcess.appendChild(processName);

            index++;
        }
        
        time++;
        if(time == maxCompletionTime) clearInterval(timeline);
    }, 1000);

    let timeForTime = 0;
    let remTimeLine = setInterval(function(){

        const newSecond = document.createElement("div");
        const secondText = document.createElement("p");
        newSecond.classList.add("secs");
        newSecond.style.width = secWidthString;
        secondText.innerHTML = Number(timeForTime+1);
        secondText.style.color = "black";
        newSecond.style.textAlign = "center";
        newSecond.appendChild(secondText);
        timeLine.appendChild(newSecond);
        timer.innerHTML = Number(timeForTime+1);
        timeForTime++;
        if(timeForTime == maxCompletionTime) clearInterval(remTimeLine);

    }, 1000);
    
    // after gantt chart animation this fn uodates the table with all the calculated values
    updateTable(burstTime, completionTime, finalItems, arrivalTime); 
}

function updateTable(burstTime, completionTime, finalItems, arrivalTime){
    // to access table elements : syntax : table.rows[i].cells[c];

    for(let i=0; i<5; i++){
        resultsTable.rows[i+1].cells[0].innerHTML = i; //Process ID
        resultsTable.rows[i+1].cells[1].innerHTML = arrivalTime[i];
        resultsTable.rows[i+1].cells[2].innerHTML = burstTime[i];
        resultsTable.rows[i+1].cells[3].innerHTML = completionTime[i];
        resultsTable.rows[i+1].cells[4].innerHTML = completionTime[i] - arrivalTime[i]; // Turn Around time
        resultsTable.rows[i+1].cells[5].innerHTML = (completionTime[i] - arrivalTime[i]) - burstTime[i]; // Waiting time
    }
    
}