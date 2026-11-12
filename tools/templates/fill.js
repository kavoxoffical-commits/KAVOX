(function(){
  var more = {
   'Emily Carter':{summary:' Known for building practical workflows, keeping priorities clear under tight deadlines, and leaving teams better organised than she found them.',
     jobs:[{title:'Project Management Student Assistant',company:'University of Toronto',dates:'2016 – 2017',bullets:['Supported project timelines, meeting notes, and team follow-ups.','Updated task boards and tracked deadlines for student initiatives.']}],
     edu:[{degree:'Certificate in Agile Leadership',institution:'Scrum Alliance',dates:'2021'}] , sk:['Reporting','Change Management']},
   'Daniel Mercer':{summary:' Brings a calm, data-led approach to negotiations and has repeatedly turned underperforming territories into top regions.',
     jobs:[{title:'Account Executive',company:'Brightline Networks',dates:'2009 – 2012',bullets:['Exceeded annual quota in each full year in role.','Won the company’s rookie of the year award.']}],
     edu:[{degree:'Certificate in Executive Leadership',institution:'Northwestern University',dates:'2018'}], sk:['Hiring','Coaching']},
   'Lena Hoffmann':{summary:' Enjoys turning messy handovers into clear, repeatable processes that teams can run without her.',
     jobs:[{title:'Operations Intern',company:'Brandenburg Logistics',dates:'2015 – 2016',bullets:['Assisted with route planning and warehouse audits.','Documented picking procedures for new staff.']}],
     edu:[{degree:'Certificate in Lean Six Sigma Green Belt',institution:'TÜV Rheinland',dates:'2020'}], sk:['Reporting','Negotiation']},
   'Rohan Patel':{summary:' Comfortable working across the stack, from schema design to deployment, and writing documentation that other engineers actually read.',
     jobs:[{title:'Software Engineering Intern',company:'Infoscale',dates:'2018 – 2019',bullets:['Built REST endpoints for an internal inventory tool.','Wrote unit tests that caught regressions before release.']}],
     edu:[{degree:'AWS Certified Developer – Associate',institution:'Amazon Web Services',dates:'2022'}], sk:['Kubernetes','GraphQL']},
   'Amira Haddad':{summary:' Equally at home presenting to the board and working through campaign details with the creative team.',
     jobs:[{title:'Marketing Executive',company:'Gulf Media House',dates:'2013 – 2016',bullets:['Coordinated print and digital placements for retail clients.','Reported campaign results to account directors every month.']}],
     edu:[{degree:'Certificate in Digital Marketing',institution:'Google Digital Academy',dates:'2019'}], sk:['Copywriting','SEO']},
   'Marcus Bell':{summary:' Keen to move into a senior planning role where modelling quality and clear communication make a visible difference.',
     jobs:[{title:'Finance Intern',company:'Lombard Street Bank',dates:'2018 – 2019',bullets:['Assisted with month-end close and accruals.','Built a dashboard that tracked departmental spend.']}],
     edu:[{degree:'CFA Level II Candidate',institution:'CFA Institute',dates:'2023'}], sk:['Valuation','Treasury']}
  };
  var EXTRA=['Partnered with leadership to set quarterly priorities and measure progress against them.','Documented processes so new team members could ramp up in half the time.','Presented results to senior stakeholders and adjusted plans based on feedback.','Worked across departments to resolve blockers before they affected delivery.'];
  window.PEOPLE.forEach(function(p){
    var m=more[p.name]; if(!m) return;
    p.summary+=m.summary;
    p.experience.forEach(function(j,i){ if(j.bullets.length<4) j.bullets.push(EXTRA[i%EXTRA.length]); });
    p.experience=p.experience.concat(m.jobs);
    p.education=p.education.concat(m.edu);
    p.skills=p.skills.concat(m.sk);
  });
})();
