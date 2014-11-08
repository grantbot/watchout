// start slingin' some d3 here.

var gameOptions = {
  height: 450,
  width: 700,
  nEnemies: 10,
  padding: 5

}

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
        .attr('r', 5);

  enemies.exit()
      .remove();

  enemies
      .transition()
      .duration(2000)
      .attr('cx', function(enemy) { return axes.x(enemy.x)})
      .attr('cy', function(enemy) { return axes.y(enemy.y)})


};

var tweenWithCollisionDetection = function(endData){

  var enemy = d3.select(this);

  var startPos = {
    x: parseFloat(enemy.attr('cx')),
    y: parseFloat(enemy.attr('cy'))
  };

  var endPos = {
      x: axes.x(endData.x),
      y: axes.y(endData.y)
    };
};

var play = function() {
  var newEnemies = createEnemies();
  render(newEnemies);
}

setInterval(play, 2000);
