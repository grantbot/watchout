// start slingin' some d3 here.

//Set game options
var gameOptions = {
  height: 500,
  width: 900,
  nEnemies: 50,
  padding: 5
}

//Set some other game options off of those ones
//(Couldn't assign them within the object literal)
gameOptions.minX = gameOptions.padding;
gameOptions.maxX = gameOptions.width - gameOptions.padding;
gameOptions.minY = gameOptions.padding;
gameOptions.maxY = gameOptions.height - gameOptions.padding;


var gameStats = {
  score: 0,
  highScore: 0
}

//X and y here are functions that, when given a number between 0 and 100,
//scales that value to be the correct coordinate in pixels, parameterized
//by the gameboard dimensions. This lets us pass random values between 0 and 100
//and convert those values into points on the board.
axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameOptions.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameOptions.height])
}

//We call this in a setInterval later. Constantly updates the score JS variable
//and uses d3 to update it in the HTMl
var updateScore = function(){
  gameStats.score ++;
  d3.select(".current")
    .select('span')
    .text(gameStats.score.toString());
}

//We call this only on collisions.
var updateBestScore = function(){
  gameStats.highScore = Math.max(gameStats.highScore, gameStats.score);
  gameStats.score = 0;

  d3.select(".high")
    .select('span')
    .text(gameStats.highScore.toString());
}


//Initialize gameBoard variable as the d3 selection of the .container element
//in the DOM. Append an SVG 'canvas' with the gameboard's dimensions.
var gameBoard = d3.select('.container').append('svg:svg')
                .attr('width', gameOptions.width)
                .attr('height', gameOptions.height)


//Player constructor.
var Player = function(){
    this.fill = '#ff6600';
    this.x = 0;
    this.y = 0;
    this.r = 10;
};

//Rendering method appends player to the svg and sets up d3.drag behavior.
Player.prototype.playerRender = function(){
   this.el = gameBoard.append('svg:circle')
              .attr('class', 'player')
              .attr('fill', this.fill)
              .attr('cx', gameOptions.width * 0.5)
              .attr('cy', gameOptions.height * 0.5)
              .attr('r', this.r)


//Extracts player's old coordinates from their svg attributes and adds
//to them the info from the d3 drag listener.
var dragMove = function(){
  var newX = this.cx.baseVal.value + d3.event.dx;
  var newY = this.cy.baseVal.value + d3.event.dy;

//Make sure player doesn't go off the board
  if(newX <= gameOptions.minX){
    newX = gameOptions.minX;
  } else if (newX >= gameOptions.maxX){
    newX = gameOptions.maxX;
  }

  if(newY <= gameOptions.minY){
    newY = gameOptions.minY;
  } else if (newY >= gameOptions.maxY){
    newY = gameOptions.maxY;
  }

//Set the new coordinates
  this.setAttributeNS(null, 'cx', newX);
  this.setAttributeNS(null, 'cy', newY);
};

//Set up drag handling function. D3's function passes deltas to dragMove.
//Why don't we need to add dx and dy as args on dragMove?
  var drag = d3.behavior.drag().on('drag', dragMove);

//Call drag handling function on the player svg element
  return this.el.call(drag);
};





//Create a number of enemies based on the game options, giving them each an id
//between 0 and n-1. For each of them,
var createEnemies = function(){
  var enemies = [];
  for(var i = 0; i < gameOptions.nEnemies; i++){
    enemies.push(i);
  }

//For each of them, create an object with their id and random x,y coordinates
  return enemies.map(function(i){
  return {
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100
  }
  });
};

//Takes an enemy object array
var render = function(enemy_data){

//Chain new d3 commands at the end of the gameBoard selection
//Select all circles with '.enemy' class, and bind the ids
  var enemies = gameBoard.selectAll('circle.enemy')
  .data(enemy_data, function(d){
    return d.id;
  });

//Select the ones that aren't yet on the DOM and append them as SVGs,
//translating their x,y coordinates into SVG attributes
  enemies.enter()
      .append('svg:circle')
        .attr('class', 'enemy')
        .attr('cx', function(enemy) { return axes.x(enemy.x)})
        .attr('cy', function(enemy) { return axes.y(enemy.y)})
        .attr('r', 10);

//Remove any that weren't in the data set (never really happens)
  enemies.exit()
      .remove();

//Select them all again (including new ones) and animate the update
//to their new locations, passing in our custom tween function to track
//their instantaneous positions.
  enemies
      .transition()
      .duration(2000)
      .attr('cx', function(enemy) { return axes.x(enemy.x)})
      .attr('cy', function(enemy) { return axes.y(enemy.y)})
      .tween('custom', tweenWithCollisionDetection);
};


//Custom tween function that get access to beginning and end coordinates.
//Returns a function that interpolates between them and constantly checks for collisions.
//t is a value between 0 and 1, where 0 represents the beginning of the transition and 1
//represents the end.
var tweenWithCollisionDetection = function(endData){

  var enemy = d3.select(this);

  var startPos = {
    x: parseFloat(enemy.attr('cx')),
    y: parseFloat(enemy.attr('cy')),
    r: parseFloat(enemy.attr('r'))
  };

  var endPos = {
      x: axes.x(endData.x),
      y: axes.y(endData.y)
    };

//Return function that takes the t parameter
  return function(t){
    //Calculate instant coordinates
    var instantX = startPos.x + ((endPos.x - startPos.x) * t);
    var instantY = startPos.y + ((endPos.y - startPos.y) * t);

    var movingEnemy = {
      x: instantX,
      y: instantY,
      r: startPos.r
    };

    //Send them to collision check function
    checkCollision(movingEnemy, onCollision);
  }

};

var checkCollision = function (enemy, collidedCallback){
  //When pythagorean distance is less than sum of two objects' radii, we
  //have a collision
  radiusSum = enemy.r + player.r;
  xDiff = enemy.x - player.el.attr('cx');
  yDiff = enemy.y - player.el.attr('cy');
  var separation = Math.sqrt( Math.pow(xDiff, 2) + Math.pow(yDiff, 2) );

  if(separation < radiusSum){
    collidedCallback(player, enemy);
  }
};

var onCollision = function(){
  updateBestScore();
}

//Instantiate and render a player
var player = new Player;
player.playerRender();


var play = function() {

  //Call render on a set interval to randomly update enemy positions
  var refresh = function() {
    var newEnemies = createEnemies();
    render(newEnemies);
  }

  refresh();
  setInterval(refresh, 2000);

//Start incrementing current score
  setInterval(updateScore, 100);


};


//Play on!
play();


