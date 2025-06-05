const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const token = "0a1976f77487650bd208b0933b998921edce3289"; // Store in env variable later
  const projectId = "2354707995";

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const [tasksRes, sectionsRes] = await Promise.all([
    fetch(`https://api.todoist.com/rest/v2/tasks?project_id=${projectId}`, { headers }),
    fetch(`https://api.todoist.com/rest/v2/sections?project_id=${projectId}`, { headers })
  ]);

  const tasks = await tasksRes.json();
  const sections = await sectionsRes.json();

  const sectionMap = {};
  sections.forEach(sec => sectionMap[sec.id] = { name: sec.name, tasks: [] });

  tasks.forEach(task => {
    const sid = task.section_id || "__ungrouped";
    if (!sectionMap[sid]) {
      sectionMap[sid] = { name: "Ungrouped", tasks: [] };
    }
    sectionMap[sid].tasks.push(task.content);
  });

  let html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Home Tasks</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; color: #222; max-width: 700px; margin: 2rem auto; padding: 1rem; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    .section-title { font-weight: bold; font-size: 1.2rem; margin-top: 2rem; border-bottom: 1px solid #ccc; padding-bottom: 0.2rem; }
    ul { list-style: none; padding-left: 1rem; }
    li::before { content: '\25FB'; margin-right: 0.5rem; }
  </style>
</head><body>
<h1>🏡 Home Task List</h1>`;

  for (const sid in sectionMap) {
    const section = sectionMap[sid];
    if (section.tasks.length === 0) continue;
    html += `<div class='section-title'>${section.name}</div><ul>`;
    section.tasks.forEach(task => html += `<li>${task}</li>`);
    html += `</ul>`;
  }

  html += `</body></html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body: html
  };
};
