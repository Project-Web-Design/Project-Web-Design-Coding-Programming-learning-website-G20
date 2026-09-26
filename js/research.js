(function(){
  "use strict";

  var articles = [
    {title:"Introduction to Programming Languages", cat:"Programming Languages", desc:"Learn how programming languages work and understand the differences between popular programming languages.", author:"CPLW Team", date:"2026-08-02", popularity:96},
    {title:"How the Web Actually Works", cat:"Web Development", desc:"A beginner's map of browsers, servers, and requests — what happens when you load a page.", author:"CPLW Team", date:"2026-07-18", popularity:88},
    {title:"Data Structures Everyone Should Know", cat:"Data Structures", desc:"Arrays, stacks, queues, and maps explained with everyday analogies.", author:"CPLW Team", date:"2026-06-30", popularity:74},
    {title:"Thinking in Algorithms", cat:"Algorithms", desc:"Why algorithmic thinking matters even before you write your first sort function.", author:"CPLW Team", date:"2026-09-05", popularity:81},
    {title:"The Software Development Lifecycle", cat:"Software Development", desc:"From idea to shipped product — the stages every project moves through.", author:"CPLW Team", date:"2026-05-11", popularity:65},
    {title:"What Is Computer Science, Really?", cat:"Computer Science", desc:"Separating the field of computer science from the craft of programming.", author:"CPLW Team", date:"2026-04-22", popularity:70},
    {title:"Free Resources for Self-Taught Programmers", cat:"Educational Resources", desc:"A curated starting list of resources to keep learning beyond CPLW.", author:"CPLW Team", date:"2026-09-12", popularity:92},
    {title:"Programming Fundamentals in Plain English", cat:"Programming Fundamentals", desc:"The core ideas behind every language, explained without jargon.", author:"CPLW Team", date:"2026-03-14", popularity:59}
  ];

  var categories = ["Programming Fundamentals","Web Development","Software Development","Programming Languages","Algorithms","Data Structures","Computer Science","Educational Resources"];

  var catGrid = document.getElementById("catGrid");
  categories.forEach(function(c){
    var el = document.createElement("div");
    el.className = "card cat-chip";
    el.textContent = c;
    catGrid.appendChild(el);
  });
  var categoryFilter = document.getElementById("categoryFilter");
  categories.forEach(function(c){
    var opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    categoryFilter.appendChild(opt);
  });

  var articleGrid = document.getElementById("articleGrid");
  var researchSearch = document.getElementById("researchSearch");
  var sortFilter = document.getElementById("sortFilter");

  function renderArticles(){
    var q = researchSearch.value.trim().toLowerCase();
    var cat = categoryFilter.value;
    var sort = sortFilter.value;
    var list = articles.filter(function(a){
      var matchesQ = !q || a.title.toLowerCase().indexOf(q) > -1 || a.desc.toLowerCase().indexOf(q) > -1;
      var matchesCat = cat === "all" || a.cat === cat;
      return matchesQ && matchesCat;
    });
    list.sort(function(a,b){
      if (sort === "popular") return b.popularity - a.popularity;
      return new Date(b.date) - new Date(a.date);
    });
    articleGrid.innerHTML = "";
    if (!list.length){
      articleGrid.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1;">No articles match your search yet — try a different keyword or category.</p>';
      return;
    }
    list.forEach(function(a){
      var el = document.createElement("div");
      el.className = "card article-card";
      var d = new Date(a.date);
      var dateStr = d.toLocaleDateString(undefined, {year:"numeric", month:"short", day:"numeric"});
      el.innerHTML =
        '<span class="badge">'+a.cat+'</span>' +
        '<h3>'+a.title+'</h3>' +
        '<p>'+a.desc+'</p>' +
        '<div class="article-foot"><span>'+a.author+' · '+dateStr+'</span><a href="#" class="link-more">Read Research →</a></div>';
      articleGrid.appendChild(el);
    });
  }
  researchSearch.addEventListener("input", renderArticles);
  categoryFilter.addEventListener("change", renderArticles);
  sortFilter.addEventListener("change", renderArticles);
  renderArticles();

})();
