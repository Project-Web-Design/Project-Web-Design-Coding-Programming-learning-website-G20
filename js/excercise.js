(function(){
  "use strict";

  window.CPLW = window.CPLW || {};
  var exercises = window.CPLW.exercises || [];

  var currentExercise = exercises[0];
  var codeInput = document.getElementById("codeInput");
  var outputArea = document.getElementById("outputArea");
  var feedbackArea = document.getElementById("feedbackArea");

  function loadExercise(e){
    currentExercise = e;
    document.getElementById("exTitle").textContent = e.title;
    document.getElementById("exDesc").textContent = "Topic: " + e.topic + ". Write the code below to solve this exercise, then run it to check the output.";
    codeInput.value = e.code;
    outputArea.textContent = "Run your code to see the output here.";
    feedbackArea.textContent = "";
    feedbackArea.className = "feedback";
  }
  window.CPLW.loadExercise = loadExercise;

  function mockRun(code){
    var lines = code.split("\n");
    var out = [];
    var vars = {};
    lines.forEach(function(line){
      var varMatch = line.match(/^\s*(?:let|const|var)\s+(\w+)\s*=\s*(.+?);?\s*$/);
      if (varMatch) { vars[varMatch[1]] = varMatch[2].trim(); }
      var logMatch = line.match(/console\.log\((.+)\)\s*;?\s*$/);
      if (logMatch) { out.push(evalExpr(logMatch[1].trim(), vars)); }
    });
    return out.join("\n");
  }
  function evalExpr(expr, vars){
    if (/^["'].*["']$/.test(expr)) return expr.slice(1,-1);
    if (/^-?\d+(\.\d+)?$/.test(expr)) return expr;
    if (expr === "true" || expr === "false") return expr;
    if (vars[expr] !== undefined) return evalExpr(vars[expr], vars);
    if (expr.indexOf("+") > -1) {
      return expr.split("+").map(function(p){ return evalExpr(p.trim(), vars); }).join("");
    }
    return expr;
  }

  document.getElementById("runBtn").addEventListener("click", function(){
    try {
      var result = mockRun(codeInput.value);
      outputArea.textContent = result || "(no output — try using console.log)";
      feedbackArea.textContent = "";
      feedbackArea.className = "feedback";
    } catch(err){
      outputArea.textContent = "Error running your code.";
    }
  });
  document.getElementById("resetBtn").addEventListener("click", function(){
    codeInput.value = currentExercise.code;
    outputArea.textContent = "Run your code to see the output here.";
    feedbackArea.textContent = "";
    feedbackArea.className = "feedback";
  });
  document.getElementById("submitBtn").addEventListener("click", function(){
    var result = mockRun(codeInput.value);
    outputArea.textContent = result || "(no output)";
    if (result.trim() === currentExercise.expected.trim()) {
      feedbackArea.textContent = "✓ Correct! Expected output: " + currentExercise.expected;
      feedbackArea.className = "feedback ok";
    } else {
      feedbackArea.textContent = "Try again — check your variable names. Expected output: " + currentExercise.expected;
      feedbackArea.className = "feedback bad";
    }
  });

})();(function(){
  "use strict";

  window.CPLW = window.CPLW || {};

  var exercises = [
    {title:"Create Your First Variable", level:"Beginner", topic:"Variables", time:"5 min", code:'let name = "John";\nconsole.log(name);', expected:"John"},
    {title:"Check If a Number Is Positive", level:"Beginner", topic:"Conditions", time:"7 min", code:'let num = 5;\nif (num > 0) {\n  console.log("Positive");\n}', expected:"Positive"},
    {title:"Print Numbers 1 to 5", level:"Beginner", topic:"Loops", time:"8 min", code:'for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}', expected:"1\n2\n3\n4\n5"},
    {title:"Write a Greeting Function", level:"Beginner", topic:"Functions", time:"6 min", code:'function greet(name) {\n  return "Hello " + name;\n}\nconsole.log(greet("CPLW"));', expected:"Hello CPLW"},
    {title:"Sum an Array of Numbers", level:"Intermediate", topic:"Arrays", time:"10 min", code:'let nums = [1, 2, 3, 4];\nlet sum = 0;\nfor (let n of nums) {\n  sum += n;\n}\nconsole.log(sum);', expected:"10"},
    {title:"Compare Two Variables", level:"Beginner", topic:"Variables", time:"5 min", code:'let a = 4;\nlet b = 7;\nconsole.log(a < b);', expected:"true"}
  ];
  window.CPLW.exercises = exercises;

  var filters = ["All","Beginner","Variables","Conditions","Loops","Functions","Arrays"];
  var filterRow = document.getElementById("filterRow");
  var activeFilter = "All";
  filters.forEach(function(f){
    var b = document.createElement("button");
    b.className = "filter-btn" + (f === "All" ? " active" : "");
    b.textContent = f;
    b.setAttribute("data-filter", f);
    b.addEventListener("click", function(){
      activeFilter = f;
      Array.prototype.forEach.call(filterRow.children, function(c){ c.classList.remove("active"); });
      b.classList.add("active");
      renderExercises();
    });
    filterRow.appendChild(b);
  });

  var exerciseGrid = document.getElementById("exerciseGrid");
  function renderExercises(){
    exerciseGrid.innerHTML = "";
    exercises
      .filter(function(e){
        if (activeFilter === "All") return true;
        if (activeFilter === "Beginner") return e.level === "Beginner";
        return e.topic === activeFilter;
      })
      .forEach(function(e){
        var el = document.createElement("div");
        el.className = "card ex-card";
        el.innerHTML =
          '<h3>'+e.title+'</h3>' +
          '<div class="ex-meta"><span>'+e.level+'</span><span>'+e.topic+'</span><span>'+e.time+'</span></div>' +
          '<button class="btn btn-secondary btn-sm" style="align-self:flex-start; margin-top:6px;">Start Exercise</button>';
        el.querySelector("button").addEventListener("click", function(){
          window.CPLW.loadExercise(e);
          document.getElementById("editorShell").scrollIntoView({behavior:"smooth", block:"start"});
        });
        exerciseGrid.appendChild(el);
      });
  }
  renderExercises();

})();
