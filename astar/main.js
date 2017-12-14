(function () {
  "use strict";

  var WIDTH = 15;
  var HEIGHT = 15;

  var placeStart = true;
  var pathStart = null;
  var pathEnd = null;
  var grid = [];

  //---------------------------------------------------------------------------------------------//
  // UI Manipulation and grid
  //---------------------------------------------------------------------------------------------//
  function setChecked(target) {
    target.element.classList.add("checked");
  }

  function setPath(target) {
    target.element.classList.add("path");
  }

  function clearPath() {
    for (var i = 0; i < grid.length; i++) {
      var gridObj = grid[i];
      gridObj.element.classList.remove("checked");
      gridObj.element.classList.remove("path");
      gridObj.element.innerText = "";
    }
  }

  function placeStartEnd(target) {
    if (!target.isWall) {
      if (placeStart) {
        if (pathStart)
          pathStart.element.classList.remove("start");

        pathStart = target;
        pathStart.element.classList.add("start");
      }
      else {
        if (pathEnd)
          pathEnd.element.classList.remove("end");

        pathEnd = target;
        pathEnd.element.classList.add("end");
      }

      placeStart = !placeStart;
    }
  }

  function toggleWall(target) {
    if (target.isWall)
      target.element.classList.remove("wall");
    else
      target.element.classList.add("wall");

      target.isWall = !target.isWall;
  }

  function onGridClick(e) {
    if (e.button === 0)
      placeStartEnd(this);
    else if (e.button === 2)
      toggleWall(this);

    findPath();
  }

  function buildGrid(width, height) {
    var gridId = 0;

    for (var y = 0; y < height; y++) {
      var row = document.createElement("div");
      row.className = "gridrow";

      for (var x = 0; x < width; x++) {
        var gridObj = {};
        var square = document.createElement("div");
        square.id = "grid" + gridId;
        square.className = "gridsquare";
        square.onmouseup = onGridClick.bind(gridObj);
        square.oncontextmenu = () => false;

        gridObj.gridId = gridId++;
        gridObj.element = square;
        gridObj.isWall = false;
        gridObj.x = x;
        gridObj.y = y;

        row.appendChild(square);
        grid.push(gridObj);
      }

      document.body.appendChild(row);
    }
  }


  //---------------------------------------------------------------------------------------------//
  // Priority Queue
  //---------------------------------------------------------------------------------------------//
  function enqueue(q, item, priority) {
    for (var i = 0; i < q.length; i++) {
      if (q[i].priority >= priority) { // >= is important for A*. Using just > will lead to a much large problem space search
        q.splice(i, 0, {
          priority: priority,
          item: item
        });
        return;
      }
    }

    q.push({
      priority: priority,
      item: item
    });
  }

  function dequeue(q) {
    return q.shift().item;
  }


  //---------------------------------------------------------------------------------------------//
  // A*
  //---------------------------------------------------------------------------------------------//
  function checkAndAddChild(children, target) {
    if (!target.isWall)
      children.push(target);
  }

  function getValidChildren(target) {
    var children = [];
    var gridId = target.gridId;
    
    // By alternating between favouring x first vs y first, we get more pleasing paths rather than simple L shaped paths
    // The path distances still come out the same
    if ((target.y % 2) + (target.x % 2) == 1)
    {
      if (target.y > 0)
        checkAndAddChild(children, grid[gridId - WIDTH]);
    
      if (target.y < (HEIGHT - 1))
        checkAndAddChild(children, grid[gridId + WIDTH]);

      if (target.x > 0)
        checkAndAddChild(children, grid[gridId - 1]);

      if (target.x < (WIDTH - 1))
        checkAndAddChild(children, grid[gridId + 1]);
    }
    else {
      if (target.x > 0)
        checkAndAddChild(children, grid[gridId - 1]);

      if (target.x < (WIDTH - 1))
        checkAndAddChild(children, grid[gridId + 1]);
    
      if (target.y > 0)
        checkAndAddChild(children, grid[gridId - WIDTH]);
    
      if (target.y < (HEIGHT - 1))
        checkAndAddChild(children, grid[gridId + WIDTH]);
    }
  
    return children;
  }

  function distanceBetween(a, b) {
    var dX = Math.abs(a.x - b.x);
    var dY = Math.abs(a.y - b.y);
    return dX + dY;
  }

  function findPath() {
    clearPath();

    if (!pathStart || !pathEnd) return;

    var path = {};
    var queue = [];
    var costSoFar = {};

    enqueue(queue, pathStart, 0);
    costSoFar[pathStart.gridId] = 0;

    while (queue.length != 0) {
      var current = dequeue(queue);
      if (current === pathEnd) break;
    
      var children = getValidChildren(current);
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var newCost = costSoFar[current.gridId] + 1;
        if (!(child.gridId in costSoFar) || newCost < costSoFar[child.gridId]) {
          costSoFar[child.gridId] = newCost;
          enqueue(queue, child, newCost + distanceBetween(child, pathEnd));
          setChecked(child);
          path[child.gridId] = current;
          //child.element.innerText = "" + newCost + "/" + distanceBetween(child, pathEnd);
        }
      }
    }

    visualisePath(path);
  }

  function visualisePath(path) {
    var node = path[pathEnd.gridId];
    while (!!node && node != pathStart) {
      setPath(node);
      node = path[node.gridId];
    }
  }


  //---------------------------------------------------------------------------------------------//
  // The rest
  //---------------------------------------------------------------------------------------------//
  function main() {
    buildGrid(WIDTH, HEIGHT);
  }

  window.onload = main;
})();
