const IfGameJS = ()  => {
	//Add onclick listeners
	document.querySelector("#robot-submit").addEventListener('click', ()=>{robotGo();});
	document.querySelector("#robot-try-again").addEventListener('click', ()=>{robotRestart();});
	document.querySelector("#show-hide-ifGameCode").addEventListener('click', ()=>{changeCodeVisibility();});
	
	//These will become PHP session variables 
	var MAX_MOVES = 20;
	var id = null;
	var level = 0;
	var level_start_positions = [0];
	var level_goal_positions = [8];
	var attempts = 0;

	//show/hide the code section
	function changeCodeVisibility() {
		var code = document.querySelector("#ifCode");
		if (getComputedStyle(code).visibility === "hidden") {
			code.style.visibility = "visible";
		}
		else {
			code.style.visibility = "hidden";
		}
	}

	//Send the robot back it's starting position in the array
	function robotRestart() {
		//Clear the robot from its current position and reset state
		var robot = document.querySelector("#robot");
		robot.parentNode.innerHTML = '';
		attempts = 0;

		//Place the robot back at the start position
		var game_grid = document.querySelector("#game-grid");
		var position_array = game_grid.childNodes;
		var robot_start_pos = level_start_positions[level];
		var goal_pos = level_goal_positions[level];
		position_array[goal_pos].innerHTML = "<img id='goal' src='../images/treasure.png' draggable='false' />";
		position_array[robot_start_pos].innerHTML = "<img id='robot' src='../images/robot.png' draggable='false' />";

		//clear game status message 
		resetAttempts();
		document.querySelector("#game-status").innerHTML = '';

		//hide the play again button and enable the go button
		document.querySelector("#robot-try-again").style.visibility = "hidden";
		document.querySelector("#robot-submit").disabled = false;
	}
		
	//Parse the user's action print out the corresponding code snippets
	function printCode(on_front_wall, on_bottom_wall, robot_default) {
		var front_wall_code = ''; //action to perform on front wall
		var bottom_wall_code = ''; //action to perform on bottom wall
		var default_code = ''; //default action to perform

		var code_output = document.querySelector("#ifGameCode-output");
		var code_elements = document.querySelector("#ifGameCode-elements");
		var code = ''; //the user's actions translated to python code

		switch (on_front_wall) {
			case "Down":
				front_wall_code = "vpos = vpos - 1"; //move downwards
				break;
			case "Up":
				front_wall_code = "vpos = vpos + 1"; //move upwards
				break;
			default:
		}

		switch (on_bottom_wall) {
			case "Left":
				bottom_wall_code = "hpos = hpos - 1"; //move left
				break;
			case "Right":
				bottom_wall_code = "hpos = hpos + 1";
				break;
			default:
		}

		switch (robot_default) {
			case "Right":
				default_code = "hpos = hpos + 1"; //move right
				break;
			case "Down":
				default_code = "vpos = vpos - 1"; //move down
				break;
			default:
		}
		
		code = 
`<pre class='ifgame_pre'><code> 
	if is_front_wall == True:
	${front_wall_code}
	elif is_bottom_wall == True:
	${bottom_wall_code}    
	else: 
	${default_code}
</code></pre>`;
		code_output.innerHTML = code;
		code_elements.style.visibility = "inherit";

	}

	function increment() {
		attempts++;
		document.querySelector("#game-attempts").innerHTML = attempts;
	}

	function resetAttempts() {
		attempts = 0;
		document.querySelector("#game-attempts").innerHTML = attempts;
	}

	function submitScore(userid, score) {

	}

	//Move the robot according the actions specified by the user
	function robotGo() {
		var on_front_wall = document.querySelector("#on-front-wall").value;
		var on_bottom_wall = document.querySelector("#on-bottom-wall").value;
		var robot_default = document.querySelector("#default").value;

		var game_status = document.querySelector("#game-status");
		var go_button = document.querySelector("#robot-submit");

		//disable the go button and generate code output
		go_button.disabled = true;
		printCode(on_front_wall, on_bottom_wall, robot_default);

		game_status.innerHTML = ''; //clear any error messages	

		var game_grid = document.querySelector("#game-grid");
		var position_array = game_grid.childNodes;
		var num_positions = game_grid.childElementCount;
		var num_rows = Math.sqrt(num_positions);
		var num_columns = num_rows;

		
		var hpos = 0; //horizontal offset
		var vpos = 0; //vertical offset
		var goal_pos = level_goal_positions[level];
		var moves = 0;
		var robot_array_pos = level_start_positions[level]; //position of robot in position array
		var robot_start_pos = robot_array_pos; 
		var error = 0;
		clearInterval(id); //stop any previous animation
		id = setInterval(moveRobot, 1000); //call the function moveRobot every second
		// Increment attempts counter
		increment();

		// Move the robot, based on instructions.
		function moveRobot() {
			moves++;
			error = false;
			
			if (moves >= MAX_MOVES) { //ran out of moves
				game_status.innerHTML("The robot took too many moves and ran out of steam. Try again.");
				position_array[robot_array_pos].innerHTML = '';
				position_array[robot_start_pos].innerHTML = "<img id='robot' src='../images/robot.png' draggable='false'>";
				clearInterval(id);
				return;
			}
			else {
			
				if (vpos + 1 >= num_rows) { //Wall below
					switch(on_bottom_wall) {
						case "Left":
						if (hpos === 0) { //going off grid
							error = true;
							break;
						}
						hpos--;
						break;
						case "Right":
							if (hpos >= num_columns) {
								error = true;
								break;
							}
							hpos++;
							break;
						default:
							error = true;
					}
				}
				else if (hpos + 1 >= num_columns) { //wall in front
					switch(on_front_wall) {
						case "Down":
							if (vpos + 1 >= num_rows) {
								error = true;
								break;
							}
							vpos++;
							break;
						case "Up":
							if (vpos === 0) {
								error = true; 						                                                                break;	  													}
							vpos--;
							break;
						default:
							error = true;
					}
				}
				else { //no wall
					switch (robot_default) {
						case "Down":
							vpos++;
							break;
						case "Right":
							hpos++;
							break;
						default:
							error = true;
					}
				}	
				if (error) {
					game_status.innerHTML = "Oops that path wasn't quite right. Try again.";
					position_array[robot_array_pos].innerHTML = '';
					position_array[robot_start_pos].innerHTML = "<img id='robot' src='../images/robot.png' draggable='false'/>";

					go_button.disabled = false;
					clearInterval(id);
					return;
				}
				position_array[robot_array_pos].innerHTML = '';
				robot_array_pos = vpos * num_rows + hpos;
				position_array[robot_array_pos].innerHTML = "<img id='robot' src='../images/robot.png' draggable='false'/>";
				if ((hpos*num_columns + vpos) === goal_pos) {
					clearInterval(id); //stop animation
					game_status.innerHTML = "Yay, Rob successfully retrieved the treasure!";
					document.querySelector("#robot-try-again").style.visibility = "visible";
					
					// Save game TODO
					submitScore(localStorage.getItem("username"), attempts);
					return;
				}	
			}
		return;
		}
	}	
}

export default IfGameJS;

