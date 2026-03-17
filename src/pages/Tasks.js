import React, { useState, useEffect } from "react";
import { tasksAPI } from "../lib/supabase";
import { I } from "../components/Icons";
import { Card, Pill, CheckBtn, IconBtn, NeuInput, NeuTextarea, BigNumber } from "../components/SharedUI";

export const SubtaskEditor = React.memo(({ task, sub, onSave, t, sh, prioColor }) => {
  const [localSub, setLocalSub] = useState(sub);

  useEffect(() => {
    setLocalSub(sub);
  }, [sub.id, sub.description, sub.due_date, sub.priority, sub.assignee_id]);

  const handleChange = (updates) => {
    const updated = { ...localSub, ...updates };
    setLocalSub(updated);
    onSave(task.id, sub.id, updates);
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <NeuTextarea
        t={t} sh={sh}
        placeholder="Description..."
        value={localSub.description || ''}
        onChange={e => setLocalSub({ ...localSub, description: e.target.value })}
        onBlur={e => onSave(task.id, sub.id, { description: e.target.value })}
        style={{ fontSize: 12 }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, color: t.grey, marginBottom: 4, fontWeight: 700 }}>DUE DATE</p>
          <NeuInput
            type="date" t={t} sh={sh}
            value={formatDateForInput(localSub.due_date)}
            onChange={e => handleChange({ due_date: e.target.value })}
          />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, color: t.grey, marginBottom: 4, fontWeight: 700 }}>PRIORITY</p>
          <div style={{ display: "flex", gap: 4 }}>
            {["low", "medium", "high"].map(p => (
              <button
                key={p}
                onClick={() => handleChange({ priority: p })}
                style={{ flex: 1, padding: "6px 0", border: "none", borderRadius: 8, fontSize: 9, fontWeight: 800, textTransform: "uppercase", background: localSub.priority === p ? prioColor[p] : t.card, color: localSub.priority === p ? "white" : t.grey, boxShadow: sh.card }}
              >
                {p[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 10, color: t.grey, marginBottom: 4, fontWeight: 700 }}>ASSIGNEE</p>
        <NeuInput
          t={t} sh={sh}
          placeholder="Assignee ID..."
          value={localSub.assignee_id || ''}
          onChange={e => setLocalSub({ ...localSub, assignee_id: e.target.value })}
          onBlur={e => onSave(task.id, sub.id, { assignee_id: e.target.value })}
        />
      </div>
    </div>
  );
});

export const TasksPage = ({ t, sh, tasks, setTasks, userId, onToast }) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [expandedSub, setExpandedSub] = useState(null);
  const [form, setForm] = useState({ title: "", category: "Personal", priority: "medium", due_date: "", notes: "", subtasks: [] });
  const [newSub, setNewSub] = useState("");
  const cats = ["All", "Work", "Personal", "Health", "Other"];
  const prioColor = { low: t.grey, medium: t.black, high: t.orange };

  const filtered = tasks.filter(t2 => filter === "All" || t2.category === filter).filter(t2 => !search || t2.title.toLowerCase().includes(search.toLowerCase()));

  const toggle = async (task) => {
    const done = !task.done;
    await tasksAPI.update(task.id, { done });
    setTasks(tasks.map(x => x.id === task.id ? { ...x, done } : x));
  };

  const del = async (id) => {
    await tasksAPI.delete(id);
    setTasks(tasks.filter(x => x.id !== id));
    onToast("Task deleted");
  };

  const toggleSub = async (taskId, sub) => {
    const done = !sub.done;
    await tasksAPI.updateSubtask(sub.id, { done });
    setTasks(tasks.map(t2 => t2.id === taskId ? { ...t2, subtasks: (t2.subtasks || []).map(s => s.id === sub.id ? { ...s, done } : s) } : t2));
  };

  const saveSubDetails = async (taskId, subId, data) => {
    await tasksAPI.updateSubtask(subId, data);
    setTasks(tasks.map(t2 => t2.id === taskId ? { ...t2, subtasks: (t2.subtasks || []).map(s => s.id === subId ? { ...s, ...data } : s) } : t2));
  };

  const addTask = async () => {
    if (!form.title.trim()) return;
    const now = new Date();
    const due = form.due_date ? new Date(form.due_date) : null;
    const overdue = due && due < now;
    const { data, error } = await tasksAPI.add(userId, { title: form.title, notes: form.notes, category: form.category, priority: form.priority, due_date: form.due_date || null, done: false, overdue });
    if (error) { onToast("Error adding task"); return; }
    const subs = [];
    for (const s of form.subtasks) {
      const { data: sd } = await tasksAPI.addSubtask(userId, data.id, s.title);
      if (sd) subs.push(sd);
    }
    setTasks([{ ...data, subtasks: subs }, ...tasks]);
    setForm({ title: "", category: "Personal", priority: "medium", due_date: "", notes: "", subtasks: [] });
    setAdding(false);
    onToast("Task added ✓");
  };

  const addSubLocal = () => {
    if (!newSub.trim()) return;
    setForm({ ...form, subtasks: [...form.subtasks, { id: Date.now(), title: newSub, done: false, description: '', due_date: null, priority: 'medium' }] });
    setNewSub("");
  };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Scheduler</p><BigNumber t={t}>TASKS</BigNumber></div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><I n="search" s={15} c={t.grey} /></span>
        <NeuInput t={t} sh={sh} placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {cats.map(c => <Pill key={c} active={filter === c} onClick={() => setFilter(c)} t={t} sh={sh}>{c}</Pill>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {filtered.map(task => (
          <Card key={task.id} t={t} sh={sh} style={{ padding: "16px 18px", opacity: task.done ? 0.55 : 1, border: task.overdue && !task.done ? `1px solid ${t.orange}40` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CheckBtn checked={task.done} onToggle={() => toggle(task)} t={t} sh={sh} />
              <div style={{ flex: 1 }} onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
                <p style={{ fontSize: 14, fontWeight: 700, textDecoration: task.done ? "line-through" : "none", color: task.overdue && !task.done ? t.orange : t.black }}>{task.title}</p>
                <p style={{ fontSize: 11, color: t.grey, marginTop: 2 }}>{task.category}{task.due_date && ` · ${task.due_date}`}{task.overdue && !task.done ? " · OVERDUE" : ""}</p>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: prioColor[task.priority] || t.grey }} />
              <IconBtn icon="trash" onClick={() => del(task.id)} t={t} sh={sh} size={30} />
            </div>
            {expanded === task.id && (
              <div style={{ marginTop: 12, paddingLeft: 12 }}>
                {(task.subtasks || []).map(s => {
                  const isSubExp = expandedSub === s.id;
                  return (
                    <div key={s.id} style={{ marginBottom: 8, padding: isSubExp ? "12px 14px" : "4px 0", borderRadius: 12, background: isSubExp ? t.bg : "transparent", boxShadow: isSubExp ? sh.inset : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckBtn checked={s.done} onToggle={() => toggleSub(task.id, s)} t={t} sh={sh} size={22} />
                        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setExpandedSub(isSubExp ? null : s.id)}>
                          <span style={{ fontSize: 13, color: t.black, fontWeight: 600, textDecoration: s.done ? "line-through" : "none" }}>{s.title}</span>
                          {!isSubExp && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: prioColor[s.priority || 'medium'] }} />
                              {s.due_date && <span style={{ fontSize: 10, color: t.grey }}>{new Date(s.due_date).toLocaleDateString()}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSubExp && (
                        <SubtaskEditor
                          task={task}
                          sub={s}
                          onSave={saveSubDetails}
                          t={t}
                          sh={sh}
                          prioColor={prioColor}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {expanded === task.id && task.notes && (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: t.bg, boxShadow: sh.inset }}>
                <p style={{ fontSize: 12, color: t.grey, lineHeight: 1.5 }}>{task.notes}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
