// start slingin' some d3 here.

//Set game options
var gameOptions = {
  height: 500,
  width: 900,
  nEnemies: 1,
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
  bestScore: 0
}

axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameOptions.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameOptions.height])
}

var gameBoard = d3.select('.container').append('svg:svg')
                .attr('width', gameOptions.width)
                .attr('height', gameOptions.height)


var createEnemies = function(){
  var enemies = [];
  for(var i = 0; i < gameOptions.nEnemies; i++){
    enemies.push(i);
  }

  return enemies.map(function(i){
  return {
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100
  }
  });
};


var Player = function(){
    this.fill = '#ff6600';
    this.x = 0;
    this.y = 0;
    this.r = 10;
};

Player.prototype.playerRender = function(){
   this.el = gameBoard.append('svg:circle')
              .attr('class', 'player')
              .attr('fill', this.fill)
              .attr('cx', gameOptions.width * 0.5)
              .attr('cy', gameOptions.height * 0.5)
              .attr('r', this.r)


var dragMove = function(){
  var newX = this.cx.baseVal.value + d3.event.dx;
  var newY = this.cy.baseVal.value + d3.event.dy;

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

  this.setAttributeNS(null, 'cx', newX);
  this.setAttributeNS(null, 'cy', newY);
};

  var drag = d3.behavior.drag().on('drag', dragMove);

  return this.el.call(drag);
};


var render = function(enemy_data){

  var enemies = gameBoard.selectAll('circle.enemy')
  .data(enemy_data, function(d){
    return d.id;
  });

  enemies.enter()
      .append('svg:circle')
        .attr('class', 'enemy')
        .attr('cx', function(enemy) { return axes.x(enemy.x)})
        .attr('cy', function(enemy) { return axes.y(enemy.y)})
        .attr('r', 10);

  enemies.exit()
      .remove();

  enemies
      .transition()
      .duration(2000)
      .attr('cx', function(enemy) { return axes.x(enemy.x)})
      .attr('cy', function(enemy) { return axes.y(enemy.y)})
      .tween('custom', tweenWithCollisionDetection);
};

var checkCollision = function (enemy, collidedCallback){
  radiusSum = enemy.r + player.r;
  xDiff = enemy.x - player.el.attr('cx');
  yDiff = enemy.y - player.el.attr('cy');
  var separation = Math.sqrt( Math.pow(xDiff, 2) + Math.pow(yDiff, 2) );

  if(separation < radiusSum){
    collidedCallback(player, enemy);
  }
};

var onCollision = function(){
  console.log("IMPACT!!!");
}

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

  return function(t){
    var instantX = startPos.x + ((endPos.x - startPos.x) * t);
    var instantY = startPos.y + ((endPos.y - startPos.y) * t);

    var movingEnemy = {
      x: instantX,
      y: instantY,
      r: startPos.r
    };

    checkCollision(movingEnemy, onCollision);
  }

};

var player = new Player;
player.playerRender();

var play = function() {
  var newEnemies = createEnemies();
  render(newEnemies);
};



setInterval(play, 2000);
