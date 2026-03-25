import { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const [cases, setCases] = useState([]);
  const [title, setTitle] = useState("");
  const [court, setCourt] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState("all"); // all, upcoming, past
  const [searchTerm, setSearchTerm] = useState("");
  const [animateCard, setAnimateCard] = useState(null);
  const formRef = useRef(null);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("cases");
    if (saved) {
      setCases(JSON.parse(saved));
    }
  }, []);

  // Save data whenever cases change
  useEffect(() => {
    localStorage.setItem("cases", JSON.stringify(cases));
  }, [cases]);

  const addCase = async () => {
    if (!title.trim() || !date) return;

    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newCase = {
      id: Date.now(),
      title: title.trim(),
      court: court.trim(),
      date,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setCases([newCase, ...cases]);
    setTitle("");
    setCourt("");
    setDate("");
    setNotes("");
    setIsAdding(false);
    
    // Scroll to top of list
    setTimeout(() => {
      const listElement = document.querySelector('.list');
      if (listElement) listElement.scrollTop = 0;
    }, 100);
  };

  const deleteCase = (id) => {
    const caseToDelete = cases.find(c => c.id === id);
    if (confirm(`Delete "${caseToDelete.title}"? This action cannot be undone.`)) {
      setAnimateCard(id);
      setTimeout(() => {
        setCases(cases.filter((c) => c.id !== id));
        setAnimateCard(null);
      }, 300);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
    }
    
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredCases = cases.filter(c => {
    const matchesFilter = filter === "all" ? true :
      filter === "upcoming" ? new Date(c.date) >= new Date() :
      new Date(c.date) < new Date();
    
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.court.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: cases.length,
    upcoming: cases.filter(c => new Date(c.date) >= new Date()).length,
    past: cases.filter(c => new Date(c.date) < new Date()).length
  };

  return (
    <div className="app">
      <div className="gavel-animation"></div>
      <div className="container">
        <header className="header">
          <div className="header-content">
            <div className="icon-wrapper">
              <span className="icon">⚖️</span>
              <span className="icon-glow"></span>
            </div>
            <div>
              <h1 className="title">LawTrack</h1>
              <p className="subtitle">Your digital chambers</p>
            </div>
          </div>
          <div className="stats-banner">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Cases</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{stats.upcoming}</span>
              <span className="stat-label">Upcoming</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{stats.past}</span>
              <span className="stat-label">Past Hearings</span>
            </div>
          </div>
        </header>

        {/* Search and Filter */}
        <div className="search-filter">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search cases, courts, or notes..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
          </div>
        </div>

        {/* FORM */}
        <form className="form" onSubmit={(e) => { e.preventDefault(); addCase(); }} ref={formRef}>
          <div className="form-header">
            <span className="form-icon">📜</span>
            <h3>Register New Case</h3>
          </div>
          
          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">⚖️</span>
              Case Title <span className="required">*</span>
            </label>
            <input
              className="input"
              placeholder="e.g., State vs. Sharma, Civil Appeal No. 42/2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">🏛️</span>
              Court / Jurisdiction
            </label>
            <input
              className="input"
              placeholder="e.g., Supreme Court of India, Delhi High Court"
              value={court}
              onChange={(e) => setCourt(e.target.value)}
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label className="input-label">
                <span className="label-icon">📅</span>
                Next Hearing <span className="required">*</span>
              </label>
              <input
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">
                <span className="label-icon">⏰</span>
                Reminder
              </label>
              <select className="input">
                <option>1 day before</option>
                <option>3 days before</option>
                <option>1 week before</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">📝</span>
              Case Notes / Observations
            </label>
            <textarea
              className="textarea"
              placeholder="Key arguments, next steps, client instructions, important deadlines..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <button 
            className={`btn btn-primary ${isAdding ? 'loading' : ''}`}
            type="submit"
            disabled={isAdding || !title.trim() || !date}
          >
            {isAdding ? (
              <>
                <span className="spinner"></span>
                Registering...
              </>
            ) : (
              <>
                <span>📌</span>
                Register Case
              </>
            )}
          </button>
        </form>

        {/* LIST */}
        <div className="list-section">
          <div className="list-header">
            <h3>Case Registry</h3>
            <span className="result-count">{filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="list">
            {filteredCases.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏛️</div>
                <h3>No cases found</h3>
                <p>{searchTerm ? "Try a different search term" : "Add your first case to begin"}</p>
              </div>
            ) : (
              filteredCases.map((c, index) => {
                const daysUntil = getDaysUntil(c.date);
                const isUpcoming = new Date(c.date) >= new Date();
                const isToday = new Date(c.date).toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={c.id} 
                    className={`case-card ${animateCard === c.id ? 'removing' : ''} ${isUpcoming ? 'upcoming' : 'past'} ${isToday ? 'today' : ''}`}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="card-header">
                      <div className="case-info">
                        <h3 className="case-title">{c.title}</h3>
                        {c.court && (
                          <span className="court-badge">{c.court}</span>
                        )}
                      </div>
                      <div className="card-actions">
                        <div className={`status-badge ${isUpcoming ? 'upcoming' : 'past'}`}>
                          {isUpcoming ? (isToday ? 'Today' : 'Upcoming') : 'Past'}
                        </div>
                        <button 
                          className="delete-btn"
                          onClick={() => deleteCase(c.id)}
                          aria-label="Delete case"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="case-detail date">
                      <span className="detail-icon">📅</span>
                      <div className="date-info">
                        <span className="date-text">{formatDate(c.date)}</span>
                        {isUpcoming && daysUntil > 0 && daysUntil !== 1 && (
                          <span className="days-badge">in {daysUntil} days</span>
                        )}
                        {isUpcoming && daysUntil === 1 && (
                          <span className="days-badge urgent">Tomorrow</span>
                        )}
                        {isUpcoming && isToday && (
                          <span className="days-badge today">Today</span>
                        )}
                      </div>
                    </div>
                    
                    {c.notes && (
                      <div className="case-notes">
                        <span className="detail-icon">📝</span>
                        <p>{c.notes}</p>
                      </div>
                    )}
                    
                    <div className="card-footer">
                      <span className="case-id">ID: #{c.id.toString().slice(-6)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}