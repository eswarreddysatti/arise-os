import { ActionBtn, NeuInput, NeuTextarea, Pill, IconBtn, CheckBtn, Card, SectionLabel, BigNumber, I } from "../App";
import React, { useState, useEffect } from "react";
import { tasksAPI } from "../lib/supabase";
import { I } from "../components/Icons";
import { Card, Pill, CheckBtn, IconBtn, NeuInput, NeuTextarea, BigNumber } from "../components/SharedUI";

export const SubtaskEditor = React.memo(({ task, sub, onSave, t, sh, prioColor }) => {
  const [localSub, setLocalSub] = useState(sub);

  useEffect(() => {
    setLocalSub(sub);
  }, [sub.id, sub.description, sub.due_date, sub.priority, sub.assignee]);

  const handleChange = (updates) => {
    const updated = { ...localSub, ...updates };
    setLocalSub(updated);
    onSave(task?.id, sub.id, updates);
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
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <p style={{ fontSize: 10, color: t.grey, marginBottom: 6, fontWeight: 800, letterSpacing: "0.1em" }}>DESCRIPTION</p>
        <NeuTextarea
          t={t} sh={sh}
          placeholder="Add details / notes..."
          value={localSub.description || ''}
          onChange={e => setLocalSub({ ...localSub, description: e.target.value })}
          onBlur={e => onSave(task?.id, sub.id, { description: e.target.value })}
          style={{ fontSize: 13, minHeight: 80 }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <p style={{ fontSize: 10, color: t.grey, marginBottom: 6, fontWeight: 800, letterSpacing: "0.1em" }}>DUE DATE</p>
          <NeuInput
            type="date" t={t} sh={sh}
            value={formatDateForInput(localSub.due_date)}
            onChange={e => handleChange({ due_date: e.target.value })}
            style={{ fontSize: 13 }}
          />
        </div>
        <div>
          <p style={{ fontSize: 10, color: t.grey, marginBottom: 6, fontWeight: 800, letterSpacing: "0.1em" }}>PRIORITY</p>
          <div style={{ display: "flex", gap: 6 }}>
            {["low", "medium", "high"].map(p => (
              <button
                key={p}
                onClick={() => handleChange({ priority: p })}
                style={{
                  flex: 1, padding: "10px 0", border: "none", borderRadius: 12,
                  fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                  background: localSub.priority === p ? prioColor[p] : t.card,
                  color: localSub.priority === p ? "white" : t.grey,
                  boxShadow: localSub.priority === p ? sh.btn : sh.card,
                  transition: "all 0.2s"
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p style={{ fontSize: 10, color: t.grey, marginBottom: 6, fontWeight: 800, letterSpacing: "0.1em" }}>ASSIGNEE</p>
        <NeuInput
          t={t} sh={sh}
          placeholder="Name or email..."
          value={localSub.assignee || ''}
          onChange={e => setLocalSub({ ...localSub, assignee: e.target.value })}
          onBlur={e => onSave(task?.id, sub.id, { assignee: e.target.value })}
          style={{ fontSize: 13 }}
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
  const [subDraft, setSubDraft] = useState({ title: "", description: "", due_date: "", priority: "medium", assignee: "" });
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
      const { data: sd } = await tasksAPI.addSubtask(userId, data.id, s.title, {
        description: s.description,
        due_date: s.due_date,
        priority: s.priority,
        assignee: s.assignee
      });
      if (sd) subs.push(sd);
    }
    setTasks([{ ...data, subtasks: subs }, ...tasks]);
    setForm({ title: "", category: "Personal", priority: "medium", due_date: "", notes: "", subtasks: [] });
    setAdding(false);
    onToast("Task added ✓");
  };

  const addSubLocal = () => {
    if (!subDraft.title.trim()) return;
    setForm({ ...form, subtasks: [...form.subtasks, { ...subDraft, id: Date.now(), done: false }] });
    setSubDraft({ title: "", description: "", due_date: "", priority: "medium", assignee: "" });
  };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Scheduler</p>
          <BigNumber t={t}>TASKS</BigNumber>
        </div>
        {!adding && <IconBtn icon="plus" onClick={() => setAdding(true)} t={t} sh={sh} size={42} active />}
      </div>

      {adding && (
        <Card t={t} sh={sh} style={{ marginBottom: 20, animation: "fadeUp 0.3s ease-out" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: t.black }}>NEW TASK</p>
            <IconBtn icon="x" onClick={() => setAdding(false)} t={t} sh={sh} size={32} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <NeuInput t={t} sh={sh} placeholder="Task title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <NeuTextarea t={t} sh={sh} placeholder="Notes (optional)..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ height: 80 }} />
            
            <div style={{ display: "flex", gap: 8 }}>
              <select 
                value={form.category} 
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ flex: 1, padding: "12px", borderRadius: 14, background: t.bg, border: "none", boxShadow: sh.inset, color: t.black, fontSize: 13, fontWeight: 600 }}
              >
                {cats.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input 
                type="date" 
                value={form.due_date} 
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                style={{ flex: 1, padding: "12px", borderRadius: 14, background: t.bg, border: "none", boxShadow: sh.inset, color: t.black, fontSize: 13, fontWeight: 600 }}
              />
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              {["low", "medium", "high"].map(p => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, priority: p })}
                  style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", fontSize: 10, fontWeight: 800, textTransform: "uppercase", background: form.priority === p ? prioColor[p] : t.card, color: form.priority === p ? "white" : t.grey, boxShadow: form.priority === p ? sh.btn : sh.card }}
                >
                  {p}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: t.grey, marginBottom: 12 }}>SUBTASKS ({form.subtasks.length})</p>
              
              <Card t={t} sh={sh} style={{ padding: 16, background: t.bg, boxShadow: sh.inset, marginBottom: 12 }}>
                <NeuInput t={t} sh={sh} placeholder="Subtask title..." value={subDraft.title} onChange={e => setSubDraft({ ...subDraft, title: e.target.value })} style={{ marginBottom: 12 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <NeuTextarea t={t} sh={sh} placeholder="Description (optional)..." value={subDraft.description} onChange={e => setSubDraft({ ...subDraft, description: e.target.value })} style={{ fontSize: 12, height: 60 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="date" value={subDraft.due_date} onChange={e => setSubDraft({ ...subDraft, due_date: e.target.value })} style={{ flex: 1, padding: "10px", borderRadius: 12, background: t.bg, border: "none", boxShadow: sh.card, color: t.black, fontSize: 12 }} />
                    <NeuInput t={t} sh={sh} placeholder="Assignee..." value={subDraft.assignee} onChange={e => setSubDraft({ ...subDraft, assignee: e.target.value })} style={{ flex: 1, fontSize: 12 }} />
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["low", "medium", "high"].map(p => (
                      <button key={p} onClick={() => setSubDraft({ ...subDraft, priority: p })} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", fontSize: 9, fontWeight: 800, textTransform: "uppercase", background: subDraft.priority === p ? prioColor[p] : t.card, color: subDraft.priority === p ? "white" : t.grey, boxShadow: sh.card }}>{p}</button>
                    ))}
                  </div>
                  <ActionBtn onClick={addSubLocal} t={t} sh={sh} secondary style={{ padding: "10px", marginTop: 4, width: "100%" }}>ADD SUBTASK</ActionBtn>
                </div>
              </Card>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {form.subtasks.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: t.card, boxShadow: sh.card }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: prioColor[s.priority || 'medium'] }} />
                      <span style={{ fontSize: 13, color: t.black, fontWeight: 600 }}>{s.title}</span>
                    </div>
                    <button onClick={() => setForm({ ...form, subtasks: form.subtasks.filter((_, idx) => idx !== i) })} style={{ border: "none", background: "transparent", color: t.orange, fontSize: 20 }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <ActionBtn onClick={addTask} t={t} sh={sh} style={{ marginTop: 10 }}>CREATE TASK</ActionBtn>
          </div>
        </Card>
      )}

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
                      <div key={s.id} style={{ marginBottom: 12, padding: "4px 0", borderRadius: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <CheckBtn checked={s.done} onToggle={() => toggleSub(task.id, s)} t={t} sh={sh} size={24} />
                          <div 
                            style={{ flex: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 14, background: isSubExp ? t.bg : "transparent", boxShadow: isSubExp ? sh.inset : "none", transition: "all 0.3s ease" }} 
                            onClick={() => setExpandedSub(isSubExp ? null : s.id)}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: prioColor[s.priority || 'medium'], transition: "transform 0.3s", transform: isSubExp ? "scale(1.2)" : "scale(1)" }} />
                              <span style={{ fontSize: 14, color: isSubExp ? t.black : t.grey, fontWeight: 700, textDecoration: s.done ? "line-through" : "none", transition: "all 0.3s" }}>{s.title}</span>
                            </div>
                            <span style={{ transform: isSubExp ? "rotate(90deg)" : "none", transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", fontSize: 14, color: isSubExp ? t.accent : t.grey }}>▸</span>
                          </div>
                        </div>
                        <div style={{ 
                          maxHeight: isSubExp ? 600 : 0, 
                          overflow: "hidden", 
                          transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s",
                          opacity: isSubExp ? 1 : 0,
                          paddingLeft: 36
                        }}>
                          <SubtaskEditor
                            task={task}
                            sub={s}
                            onSave={saveSubDetails}
                            t={t}
                            sh={sh}
                            prioColor={prioColor}
                          />
                        </div>
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
