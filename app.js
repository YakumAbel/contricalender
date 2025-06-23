    const villageDays = ['Mitang', 'Ghie', 'Sha-a', 'Nui\'i', 'Nguong', 'Nkwi\'i', 'Fuonguong', 'Nkwa'];
    const villageDescriptions = {
      'Mitang': 'Start of New week activities.',
      'Ghie': 'Traditional worship and ancestor veneration.',
      'Sha-a': 'Farming and land cultivation day.',
      'Nui\'i': 'Permanent Traditional holiday.',
      'Nguong': 'Working Day.',
      'Nkwi\'i': 'Current Traditional secondary holiday.',
      'Fuonguong': 'Preparation for market day.',
      'Nkwa': 'Major market and trade day.',
    };

    const referenceDate = new Date('2025-06-14');

    function getVillageDay(targetDate) {
      const msPerDay = 86400000;
      const diffDays = Math.floor((targetDate - referenceDate) / msPerDay);
      let dayIndex = (villageDays.indexOf('Nkwa') + diffDays) % 8;
      if (dayIndex < 0) dayIndex += 8;
      return villageDays[dayIndex];
    }

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}


    function renderCalendar(date = new Date()) {
      const today = new Date();
      const app = document.getElementById('calendar-section');
      app.innerHTML = '';

      const title = document.createElement('p');
      title.className = 'section-title';
      title.textContent = `Selected Date: ${date.toDateString()}`;
      app.appendChild(title);

      const villageDay = getVillageDay(date);
      const engDay = date.toLocaleDateString(undefined, { weekday: 'long' });

      const info = document.createElement('div');
      info.className = 'info-text';
      info.innerHTML = `
        <p><strong>Vi ${villageDay}</strong></p>
        <p class="italic">"${villageDescriptions[villageDay]}"</p>
        ${formatDate(date) === formatDate(today)
          ? '<div class="highlight">Today</div>'
          : ''}
      `;
      app.appendChild(info);

      const wrap = document.createElement('div');
      wrap.className = 'responsive-table';
      const table = document.createElement('table');
      table.innerHTML = `
        <thead>
          <tr>
            <th>Mbaw Yakum Day</th>
            <th>English Day</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector('tbody');
      const start = new Date(date);
      while (getVillageDay(start) !== 'Mitang') start.setDate(start.getDate() - 1);

      for (let i = 0; i < 8; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const vDay = getVillageDay(d);
        const eDay = d.toLocaleDateString(undefined, { weekday: 'long' });

        const row = document.createElement('tr');
        if (formatDate(d) === formatDate(date)) {
  row.className = 'bg-selected';
} else if (formatDate(d) === formatDate(today)) {
  row.className = 'bg-today';
} else if (vDay === 'Nkwa') {
  row.className = 'bg-nkwa';
}


row.innerHTML = `
  <td>Vi ${vDay}</td>
  <td>${eDay}</td>
  <td>${formatDate(d)}</td>
`;

        tbody.appendChild(row);
      }

      wrap.appendChild(table);
      app.appendChild(wrap);

      const picker = document.createElement('input');
      picker.type = 'date';
      picker.value = formatDate(date);
      picker.className = 'date-picker';
      picker.onchange = e => renderCalendar(new Date(e.target.value));
      app.appendChild(picker);

      const nav = document.createElement('div');
      nav.className = 'button-row';

      const prevBtn = document.createElement('button');
      prevBtn.textContent = '← Previous Week';
      prevBtn.className = 'button';
      prevBtn.onclick = () => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() - 8);
        renderCalendar(newDate);
      };

      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Next Week →';
      nextBtn.className = 'button';
      nextBtn.onclick = () => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 8);
        renderCalendar(newDate);
      };

      nav.appendChild(prevBtn);
      nav.appendChild(nextBtn);
      app.appendChild(nav);
    }

    function renderSearchSection() {
      const app = document.getElementById('search-section');
      app.innerHTML = `
        <h2 class="section-title">Find Dates by Day and Range</h2>
        <form id="search-form" class="form-grid">
          <div>
            <label>Start Date</label>
            <input type="date" name="start" required class="date-picker">
          </div>
          <div>
            <label>End Date</label>
            <input type="date" name="end" required class="date-picker">
          </div>
          <div>
            <label>Mbaw Yakum Day</label>
            <select name="village_day" class="date-picker">
              <option value="">--</option>
              ${villageDays.map(day => `<option value="${day}">${day}</option>`).join('')}
            </select>
          </div>
          <div>
            <label>English Day</label>
            <select name="english_day" class="date-picker">
              <option value="">--</option>
              ${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
                .map(day => `<option value="${day}">${day}</option>`).join('')}
            </select>
          </div>
          <div class="full-span" style="text-align: center;">
            <button type="submit" class="button">Search</button>
          </div>
        </form>
        <div id="search-results"></div>
      `;

      document.getElementById('search-form').onsubmit = function(e) {
        e.preventDefault();
        const form = new FormData(e.target);
        const start = new Date(form.get('start'));
        const end = new Date(form.get('end'));
        const selectedVillage = form.get('village_day');
        const selectedEnglish = form.get('english_day');

        const results = [];
        let date = new Date(start);
        while (date <= end) {
          const vDay = getVillageDay(date);
          const eDay = date.toLocaleDateString(undefined, { weekday: 'long' });
          if ((!selectedVillage || vDay === selectedVillage) &&
              (!selectedEnglish || eDay === selectedEnglish)) {
            results.push({ date: new Date(date), vDay, eDay });
          }
          date.setDate(date.getDate() + 1);
        }

        const resultsDiv = document.getElementById('search-results');
        if (results.length === 0) {
          resultsDiv.innerHTML = '<p class="no-results">No matching dates found.</p>';
          return;
        }

        let html = '<div class="responsive-table"><table>';
        html += '<thead><tr><th>Mbaw Yakum Day</th><th>English Day</th><th>Date</th></tr></thead><tbody>';
        results.forEach(r => {
          const rowClass = r.vDay === 'Nkwa' ? 'bg-nkwa' : '';
          html += `<tr class="${rowClass}"><td>Vi ${r.vDay}</td><td>${r.eDay}</td><td>${formatDate(r.date)}</td></tr>`;
        });
        html += '</tbody></table></div>';
        resultsDiv.innerHTML = html;
      };
    }

    renderCalendar();
    renderSearchSection();