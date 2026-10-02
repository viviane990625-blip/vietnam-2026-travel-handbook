const editDialog = document.createElement('dialog');
editDialog.className = 'edit-dialog';
editDialog.innerHTML = `<form id="editForm" method="dialog"><h2>修改行程</h2><p>保存后，打开网页的所有人都能看到最新安排。</p><label>时间<input name="time" required maxlength="20"></label><label>标题<input name="title" required maxlength="100"></label><label>说明<textarea name="description" required maxlength="600" rows="4"></textarea></label><label>编辑口令<input name="password" type="password" required autocomplete="off"></label><span id="editStatus" role="status"></span><div class="edit-actions"><button type="button" id="editCancel">取消</button><button type="submit">保存修改</button></div></form>`;
document.body.append(editDialog);
let activeStop = null;

function applyEdit(stop, edit) {
  stop.querySelector('time').textContent = edit.time;
  stop.querySelector('.stop-title strong').textContent = edit.title;
  stop.querySelector('p').textContent = edit.description;
}

document.querySelectorAll('.day-card').forEach((day, dayIndex) => {
  day.querySelectorAll('.stop').forEach((stop, stopIndex) => {
    stop.dataset.stopId = `${[17,18,19,20][dayIndex]}-${stopIndex}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'edit-stop';
    button.textContent = '✎ 修改';
    button.setAttribute('aria-label', `修改 ${[17,18,19,20][dayIndex]} 日第 ${stopIndex+1} 站`);
    button.addEventListener('click', () => {
      activeStop = stop;
      const form = editDialog.querySelector('form');
      form.elements.time.value = stop.querySelector('time').textContent;
      form.elements.title.value = stop.querySelector('.stop-title strong').textContent;
      form.elements.description.value = stop.querySelector('p').textContent;
      form.elements.password.value = '';
      document.getElementById('editStatus').textContent = '';
      editDialog.showModal();
    });
    stop.querySelector('div:last-child').append(button);
  });
});

document.getElementById('editCancel').addEventListener('click', () => editDialog.close());
document.getElementById('editForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!activeStop) return;
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('editStatus');
  const edit = { id: activeStop.dataset.stopId, time: form.elements.time.value.trim(), title: form.elements.title.value.trim(), description: form.elements.description.value.trim() };
  button.disabled = true;
  status.textContent = '正在保存…';
  try {
    const response = await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Editor-Password': form.elements.password.value }, body: JSON.stringify(edit) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '保存失败');
    applyEdit(activeStop, data.edit);
    editDialog.close();
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; form.elements.password.value = ''; }
});

async function loadEdits() {
  try {
    const response = await fetch('/api/state', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '读取失败');
    for (const edit of data.edits) {
      const stop = document.querySelector(`[data-stop-id="${edit.id}"]`);
      if (stop) applyEdit(stop, edit);
    }
  } catch (error) {
    const notice = document.createElement('p');
    notice.className = 'sync-warning';
    notice.textContent = `共享修改暂时未载入：${error.message}`;
    document.getElementById('dayCards').before(notice);
  }
}
loadEdits();

const noteList = document.getElementById('noteList');
function renderNotes(notes) {
  noteList.replaceChildren();
  if (!notes.length) { noteList.textContent = '还没有备注，欢迎留下第一条。'; return; }
  for (const note of notes) {
    const card = document.createElement('article');
    card.className = 'note-card card';
    const head = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = note.name;
    const time = document.createElement('time');
    time.textContent = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(note.created_at));
    const body = document.createElement('p');
    body.textContent = note.body;
    head.append(name, time);
    card.append(head, body);
    noteList.append(card);
  }
}
async function loadNotes() {
  try {
    const response = await fetch('/api/notes', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '读取失败');
    renderNotes(data.notes);
  } catch (error) { noteList.textContent = `备注暂时无法载入：${error.message}`; }
}
loadNotes();
document.getElementById('noteForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('noteStatus');
  button.disabled = true;
  status.textContent = '正在发布…';
  try {
    const response = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.querySelector('#noteName').value, body: form.querySelector('#noteText').value, website: form.querySelector('[name="website"]').value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '发布失败');
    form.querySelector('#noteText').value = '';
    status.textContent = '已发布';
    await loadNotes();
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});
