(function(){
  "use strict";

  var path = [
    {n:"01", t:"Introduction to Programming", d:"What programming is and how computers run your instructions."},
    {n:"02", t:"Variables & Data Types", d:"Store and label values like text, numbers, and true/false."},
    {n:"03", t:"Conditions", d:"Make your program decide between different paths."},
    {n:"04", t:"Loops", d:"Repeat actions without writing the same code twice."},
    {n:"05", t:"Functions", d:"Package logic into reusable, named blocks."},
    {n:"06", t:"Arrays & Objects", d:"Group related values and data together."},
    {n:"07", t:"Mini Projects", d:"Put it all together in small, complete programs."}
  ];

  var pathList = document.getElementById("pathList");
  path.forEach(function(p){
    var el = document.createElement("div");
    el.className = "path-step";
    el.innerHTML =
      '<div class="line"></div>' +
      '<div class="path-num">'+p.n+'</div>' +
      '<div class="path-body"><h4>'+p.t+'</h4><p>'+p.d+'</p></div>';
    pathList.appendChild(el);
  });

  document.getElementById("heroStartLearning").addEventListener("click", function(){
    document.getElementById("topics").scrollIntoView({behavior:"smooth"});
  });

})();
