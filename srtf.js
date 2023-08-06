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

let burstTimeForUpdatingTable = [0,0,0,0,0];

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
    let burstTime=[0,0,0,0,0];
    let finished =[0, 0, 0, 0, 0]; // bool array for checking whter array is completed or not
    
    // clear the previous gantt chart if any existed
    chart.replaceChildren(); //clears previous gantt chart
    timeLine.replaceChildren(); //clears previous timeline
    
    
    takeInput(arrivalTime, burstTime);
    
    burstTimeForUpdatingTable = burstTime;
    
    let completionTime = [0, 0, 0, 0, 0];
    
    // Clock goes from 1 to end
    let finalItems = []; // for soring final sequence of processes, acc to clock

    srtf(arrivalTime, burstTime, finished, completionTime, finalItems);
    console.log(completionTime);
    printgantchart(burstTime, completionTime, finalItems, arrivalTime);
}    
function takeInput(arrivalTime, burstTime){
    for(let i=0; i<5; i++){
        arrivalTime[i] = Number(arrivalTimesInput[i].children[0].value);   
        burstTime[i] =  Number(burstTimesInput[i].children[0].value);   
    }
}

function srtf(arrivalTime, burstTime, finished, completionTime, finalItems){
    
    let totalProcess = 0;
    let clock = 0;
    let remainingTime = burstTime;
    
    console.log(burstTime);
    while(true){ // Loop has to go on until the processes are completed
        let minBurstTime = 1000; // no process can have burst time larger or equal to this
        let currProcess = 6; // cos we only have 5 processes
        if(totalProcess == 5){
            break; // i.e all processes are completed
        }
        
        for(let i=0; i<5; i++){
            if(arrivalTime[i] <= clock && finished[i] == 0 && remainingTime[i] < minBurstTime){
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
            thisProcess.push(remainingTime[currProcess]-1);
            
            finalItems.push(thisProcess); //currProcess which is going on will be queued to our final list
            
            clock++;
            remainingTime[currProcess]--;
            if(remainingTime[currProcess] == 0){
                completionTime[currProcess] = clock;
                finished[currProcess] = 1;
                totalProcess++; // one proc is completed
            }
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
    console.log(maxCompletionTime)
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
    let startAnimation = setTimeout(function(){
        let time = 0, index = 0;
        let timeline = setInterval(function(){
            if(index == finalItems.length) clearInterval(timeline); // All the processes are executed
    
            if(index != 0 && finalItems[index][1] != finalItems[index-1][1]+1){
                let dummyWidthString = "" + widthPerSec + "px";
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
            if(finalItems[index][1] == time){
    
                const newProcess = document.createElement("div");
                const processName = document.createElement("h2");
    
                newProcess.classList.add("child-div");
                let widthString = "" + widthPerSec + "px"; 
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
            
            timeForTime++;
            timer.innerHTML = Number(timeForTime);
            if(timeForTime == maxCompletionTime) clearInterval(remTimeLine);
    
        }, 1000);
    }, 1000);
    
    // after gantt chart animation this fn uodates the table with all the calculated values
    console.log(burstTimeForUpdatingTable);
    updateTable(burstTime, completionTime, finalItems, arrivalTime); 
}

function updateTable(burstTime, completionTime, finalItems, arrivalTime){
    // to access table elements : syntax : table.rows[i].cells[c];
    let startingTimes = [-1, -1, -1, -1, -1];
    for(let i=0; i<finalItems.length; i++){
        if(startingTimes[finalItems[i][0]] == -1){
            startingTimes[finalItems[i][0]] = finalItems[i][1];
        }
    }
    for(let i=0; i<5; i++){
        resultsTable.rows[i+1].cells[0].innerHTML = i; //Process ID
        resultsTable.rows[i+1].cells[1].innerHTML = arrivalTime[i];
        resultsTable.rows[i+1].cells[2].innerHTML = Number(burstTimesInput[i].children[0].value);
        let currBurstTime = Number(burstTimesInput[i].children[0].value);
        resultsTable.rows[i+1].cells[3].innerHTML = completionTime[i];
        resultsTable.rows[i+1].cells[4].innerHTML = completionTime[i] - arrivalTime[i]; // Turn Around time
        resultsTable.rows[i+1].cells[5].innerHTML = (completionTime[i] - arrivalTime[i]) - currBurstTime; // Waiting time
    }
    
}



