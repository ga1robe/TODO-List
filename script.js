console.log("%cProject-dev","padding: 40px; background: darkmagenta;font-size:52px;color:#7FFFD4")

let $todoInput /* a place, where the user enters content of task */
let $timeInput /* a place, where the user enters time of task */
let $dateInput /* a place, where the user enters date of task */
let $diffTimesArr /* array of entries: task-content(key) and diff_time(value) */
let $warnInfo /* info about missing task / the need to suplementing content */
let $addBtn /* ADD button - adds new items to the list */
let $uList /* task list, UL tags */
let $newTask /* nowo-dodany LI, new task */
let $popup /* popup */
let $popupInfo /* text in popup, when add blank text */
let $taskToEdit /*edited task  */
let $popupInput /* Input in popup */
let $popupTimeInput /* a place, where the user update time of task */
let $popupDateInput /* a place, where the user update date of task */
let $popupAddBtn /* ADD Button in popup */
let $popupCloseBtn /* Close Button in popup */
const warnInfoEmptyMsg = "No tasks on the list"
const main = () => {
	prepareDOMElements()
	prepareDOMEvents()
}
const prepareDOMElements = () => {
	/* download all items */
    /* TODO Elements */
	$todoInput = document.body.querySelector("div.todo div.header input.todo-input")
	$timeInput = document.body.querySelector("div.todo div.header table.date tr td input#task-time")
	$dateInput = document.body.querySelector("div.todo div.header table.date tr td input#task-date")
	$warnInfo = document.body.querySelector("div.todo div.todolist p.warn-info")
	$addBtn = document.body.querySelector("div.todo div.header button.add-btn")
	$uList = document.body.querySelector("div.todo div.todolist ul")
    /* POPUP Elements */
	$popup = document.body.querySelector("div.popup")
	$popupInfo = document.body.querySelector("div.popup div.popup-body p.popup-info")
	$popupInput = document.body.querySelector("div.popup div.popup-body input.popup-input")
	$popupTimeInput = document.body.querySelector("div.popup div.popup-body table.date tr td input#task-time")
	$popupDateInput = document.body.querySelector("div.popup div.popup-body table.date tr td input#task-date")
	$popupAddBtn = document.body.querySelector("div.popup div.popup-body button.accept")
	$popupCloseBtn = document.body.querySelector("div.popup div.popup-body button.cancel")
    if($uList.querySelectorAll("li").length === 0)
		$warnInfo.textContent = warnInfoEmptyMsg
}
const prepareDOMEvents = () => {
	/* broadcasting a Listen */
	$addBtn.addEventListener("click", addNewTask)
	setTaskEndTime()
	$todoInput.addEventListener("keyup", enterKeyCheck)
	$uList.addEventListener("click",checkClick)
	$popupAddBtn.addEventListener("click",changeTask)
	$popupCloseBtn.addEventListener("click", cancelTask)
}
function setTaskEndTime(){
    const currentDate = new Date()
	if(currentDate.getMinutes() <= 30)
		currentDate.setHours(currentDate.getHours()+1,0,0)
	else if(currentDate.getMinutes() > 30 && currentDate.getMinutes() <= 45)
		currentDate.setHours(currentDate.getHours()+1,30,0)
	else if(currentDate.getMinutes() > 45)
		currentDate.setHours(currentDate.getHours()+2,0,0)
	$timeInput.value = currentDate.toLocaleTimeString()
	$dateInput.value = currentDate.toISOString().split("T")[0]
}
function convert_time_ms_to_str(time_ms){
	const diff_days = Math.floor(time_ms / (1000 * 60 * 60 * 24))
	const diff_rest_hours = Math.floor(time_ms / (1000 * 60 * 60)) % 24
	const diff_rest_minutes = Math.floor(time_ms / (1000 * 60)) % 60
	const diff_rest_seconds = Math.floor(time_ms / (1000)) % 60
	const diffTimes = diff_rest_hours.toString().padStart(2,"0").concat(":").concat(diff_rest_minutes.toString().padStart(2,"0")).concat(":").concat(diff_rest_seconds.toString().padStart(2,"0"))
	if(diff_days > 0) return "Day(s): ".concat(diff_days).concat(" ").concat(diffTimes)
	return diffTimes
}
function setDiffEndTime(){
	$diffTimesArr = []
	$uList.querySelectorAll("li").forEach(element => {
		const isElementCompleted = element.classList.contains("completed")
		const matches = element.firstChild.data.match(/End Time:(\d{1,2}(:\d{2}){1,2}) (\d{4}-\d{2}-\d{2})/)
		if(!isElementCompleted && matches !== null && matches.length > 3){
			const matchTime = matches[1]
			const matchDate = matches[3]
			const usersDate = new Date(`${matchDate} ${matchTime}`)
			const currentDate = new Date()
			const diff_ms_result = usersDate.getTime() - currentDate.getTime()
			$diffTimesArr[element.firstChild.data] = diff_ms_result
			const timeTool = element.querySelector("div.tools span.time")
			if(timeTool !== null){
				if(diff_ms_result <= 0)
					timeTool.classList.add("critical-time")
				else if(diff_ms_result > 0 && timeTool.classList.contains("critical-time"))
					timeTool.classList.remove("critical-time")
				timeTool.textContent = convert_time_ms_to_str(diff_ms_result)
			}
		} else if(isElementCompleted && element.firstChild.textContent.includes("End Time")){
			const currentNewDate = new Date()
			let currentDate = currentNewDate.getFullYear().toString().concat("-")
			currentDate += (currentNewDate.getMonth()+1).toString().padStart(2,"0").concat("-")
			currentDate += (currentNewDate.getDate()).toString().padStart(2,"0")
			let currentTime = currentNewDate.getHours().toString().padStart(2,"0").concat(":")
			currentTime += currentNewDate.getMinutes().toString().padStart(2,"0").concat(":")
			currentTime += currentNewDate.getSeconds().toString().padStart(2,"0")
			element.firstChild.textContent = element.firstChild.textContent.replace(/End Time/,"Timeout")
			timeRegex = /\d{1,2}(:\d{2}){1,2}/;
			dateRegex = /\d{4}-\d{2}-\d{2}/;
			element.firstChild.textContent = element.firstChild.textContent.replace(timeRegex,currentTime)
			element.firstChild.textContent = element.firstChild.textContent.replace(dateRegex,currentDate)
		}
	});
}
const addNewTask = () => {
	if($todoInput.value !== ""){
		$newTask = document.createElement("li")
		$newTask.textContent = $todoInput.value.concat(". End Time:").concat($timeInput.value).concat(" ").concat($dateInput.value).concat(".")
		createToolsArea($newTask)
		$uList.appendChild($newTask)
		$todoInput.value = ""
		$warnInfo.textContent = ""
	} else
		$warnInfo.textContent = "Enter the content of the task!"
	setDiffEndTime()
}
const createToolsArea = newTask => {
	const toolsDev = document.createElement("div")
	toolsDev.classList.add("tools")
	newTask.append(toolsDev)
	const completeBtn = document.createElement("button")
	const checkIco = document.createElement("i")
	checkIco.classList.add("fas","fa-check")
	completeBtn.classList.add("complete")
	completeBtn.append(checkIco)
	const timeBtn = document.createElement("span")
	timeBtn.classList.add("time")
	timeBtn.textContent = "TIME?"
	const editBtn = document.createElement("button")
	editBtn.classList.add("edit")
	editBtn.textContent = "EDIT"
	const deleteBtn = document.createElement("button")
	const timesIco = document.createElement("i")
	timesIco.classList.add("fas","fa-times")
	deleteBtn.classList.add("delete")
	deleteBtn.append(timesIco)
	toolsDev.append(timeBtn,completeBtn,editBtn,deleteBtn)
}
const checkClick = event => {
	if(event.target.matches("button.complete")){
		event.target.closest("li").classList.add("completed")
		event.target.classList.toggle("completed")
		const spanNodes = event.target.closest("li").getElementsByTagName("span")
		for(let i = 0; i < spanNodes.length; i++)
			spanNodes[0].parentNode.removeChild(spanNodes[0])
		const editBtn = event.target.closest("li").querySelector("button.edit")
		editBtn.classList.add("disable")
	} else if(event.target.matches("button.edit"))
		editTask(event)
	else if(event.target.matches("button.delete"))
		deleteTask(event)
}
const editTask = event => {
	let matchTime
	let matchDate
	$taskToEdit = event.target.closest("li")
	const matches = $taskToEdit.firstChild.data.match(/End Time:(\d{1,2}(:\d{2}){1,2}) (\d{4}-\d{2}-\d{2})/)
	if(matches.length > 3) {
		matchTime = matches[1]
		matchDate = matches[3]
	}
	$popupTimeInput.value = matchTime
	$popupDateInput.value = matchDate
	$popupInput.value = $taskToEdit.firstChild.textContent
	$popup.style.display = "flex"
}
const deleteTask = event => {
	event.target.closest("li").remove()
	const allTasks = $uList.querySelectorAll("li")
	if(allTasks.length === 0)
		$warnInfo.textContent = warnInfoEmptyMsg
}
const changeTask = () => {
	if($popupInput.value !== ""){
		timeRegex = /\d{1,2}(:\d{2}){1,2}/;
		dateRegex = /\d{4}-\d{2}-\d{2}/;
		$popupInput.value = $popupInput.value.replace(timeRegex,$popupTimeInput.value)
		$popupInput.value = $popupInput.value.replace(dateRegex,$popupDateInput.value)
		$taskToEdit.firstChild.textContent = $popupInput.value
		$popup.style.display = "none"
		$popupInfo.textContent = ""
	} else{
		$popupInfo.textContent = "You need to provide some content..."
	}
}
const cancelTask = () => {
	$popup.style.display = "none"
	$popupInfo.textContent = ""
}
const enterKeyCheck = event => {
	if((event.key === "Enter" || event.keyCode === 13) && $todoInput.value != "")
		addNewTask()
}
document.addEventListener("DOMContentLoaded", main)
setInterval(setDiffEndTime,1*1000)