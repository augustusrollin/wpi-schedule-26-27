'use strict';

// ============================================================
// SCHEDULE VALIDATOR
// ============================================================
class ScheduleValidator {
  constructor(schedule, project, projectDist) {
    // schedule: { A:['CS4341',...], B:[...], C:[...], D:[...] }
    // projectDist: array [A_credits, B_credits, C_credits, D_credits] or null
    this.sch = schedule;
    this.project = project;       // 'IQP' | 'MQP' | null
    this.dist = projectDist;      // e.g. [1,1,1,0] or [3,0,0,0]
    this.TERMS = ['A','B','C','D'];
  }

  validate() {
    const errors = [], warnings = [];

    this._creditLimits(errors);
    this._semesterTotals(errors, warnings);
    this._prerequisites(errors);
    this._availability(errors);
    this._timeConflicts(errors);
    this._projectDistribution(errors, warnings);
    this._peRules(errors);

    return { valid: errors.length === 0, errors, warnings };
  }

  // regular (non-WPE) count for one term
  _reg(term) {
    return this.sch[term].filter(id => {
      const c = getCourse(id);
      return c && c.type !== 'WPE';
    }).length;
  }

  _creditLimits(errors) {
    for (const t of this.TERMS) {
      const n = this._reg(t);
      if (n > 0 && n < 3) errors.push(`${t} term: only ${n} class${n===1?'':'es'} — minimum is 3.`);
      if (n > 4) errors.push(`${t} term: ${n} classes exceeds the maximum of 4.`);
    }
  }

  _semesterTotals(errors, warnings) {
    const fall   = [...this.sch.A, ...this.sch.B].filter(id => { const c=getCourse(id); return c && c.type!=='WPE'; });
    const spring = [...this.sch.C, ...this.sch.D].filter(id => { const c=getCourse(id); return c && c.type!=='WPE'; });
    const check = (name, arr) => {
      if (arr.length > 7)  errors.push(`${name}: ${arr.length} classes — maximum is 7.`);
      else if (arr.length < 7 && arr.length > 0)
        warnings.push(`${name}: ${arr.length}/7 classes scheduled.`);
    };
    check('Fall semester (A+B)', fall);
    check('Spring semester (C+D)', spring);
  }

  _prerequisites(errors) {
    const taken = [];
    for (const t of this.TERMS) {
      for (const id of this.sch[t]) {
        const c = getCourse(id);
        if (!c) continue;
        for (const pre of c.prerequisites) {
          if (!taken.includes(pre)) {
            const pc = getCourse(pre);
            errors.push(`${t} term: ${c.code} requires ${pc ? pc.code : pre} to be completed first.`);
          }
        }
      }
      taken.push(...this.sch[t]);
    }
    // CS 4344 (NLP) soft warning — DS 3010 is a recommended prereq
    for (const t of this.TERMS) {
      if (this.sch[t].includes('CS4344')) {
        const tIdx = this.TERMS.indexOf(t);
        const hasDS3010Before = this.TERMS.slice(0, tIdx).some(pt => this.sch[pt].includes('DS3010'));
        if (!hasDS3010Before) {
          warnings.push(`${t} term: CS 4344 (NLP) recommends DS 3010 as a prerequisite — it may be difficult without it.`);
        }
      }
    }

    // CS 3733 must precede CS 4342 (hard rule even though not listed as prereq)
    const t3733 = this._termIdx('CS3733');
    this.sch.A.concat(this.sch.B).concat(this.sch.C).concat(this.sch.D);
    for (const t of this.TERMS) {
      if (this.sch[t].includes('CS4342')) {
        const t4342 = this.TERMS.indexOf(t);
        if (t3733 === -1 || t3733 >= t4342) {
          errors.push(`${t} term: CS 4342 requires CS 3733 to be completed in a prior term.`);
        }
      }
    }
  }

  _termIdx(id) {
    for (let i = 0; i < this.TERMS.length; i++) {
      if (this.sch[this.TERMS[i]].includes(id)) return i;
    }
    return -1;
  }

  _availability(errors) {
    for (const t of this.TERMS) {
      for (const id of this.sch[t]) {
        if (!TERM_AVAIL[t].includes(id)) {
          const c = getCourse(id);
          errors.push(`${c ? c.code : id} is not offered in ${t} term.`);
        }
      }
    }
  }

  _timeConflicts(errors) {
    for (const t of this.TERMS) {
      const ids = this.sch[t].filter(id => {
        const c = getCourse(id);
        return c && c.sections[t]?.[0]?.start;
      });
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = getCourse(ids[i]), b = getCourse(ids[j]);
          if (doCourseTimesConflict(a, b, t)) {
            errors.push(`${t} term: Time conflict between ${a.code} and ${b.code}.`);
          }
        }
      }
    }
  }

  _projectDistribution(errors, warnings) {
    if (!this.project || !this.dist) return;
    const total = this.dist.reduce((a,b) => a+b, 0);
    if (total !== 3) warnings.push(`${this.project}: total credits = ${total} (should be 3).`);

    // Check for gaps
    let started=false, gapped=false;
    for (let i=0; i<4; i++) {
      if (this.dist[i] > 0) {
        if (gapped) { errors.push(`${this.project} has a gap in distribution — must be consecutive terms.`); break; }
        started = true;
      } else if (started) { gapped = true; }
    }

    // Verify schedule has project entries where dist > 0
    for (let i=0; i<4; i++) {
      const t = this.TERMS[i];
      const count = this.sch[t].filter(id => id === this.project).length;
      if (count !== this.dist[i]) {
        warnings.push(`${t} term: ${this.project} distribution says ${this.dist[i]} credit(s) but schedule has ${count}.`);
      }
    }
  }

  _peRules(errors) {
    for (const t of this.TERMS) {
      const hasPE = this.sch[t].some(id => { const c=getCourse(id); return c && c.type==='WPE'; });
      if (hasPE && this._reg(t) === 4) {
        errors.push(`${t} term: PE is only allowed when you have 3 regular classes, not 4.`);
      }
    }
  }
}

// ============================================================
// SCHEDULE GENERATOR
// ============================================================
class ScheduleGenerator {
  constructor() { this.TERMS = ['A','B','C','D']; }

  /**
   * Generate a schedule from hard requirements only.
   */
  generateRequirements(projectType, projectDist) {
    const s = { A:[], B:[], C:[], D:[] };

    // Place project credits
    if (projectType && projectDist) {
      for (let i=0; i<4; i++) {
        for (let k=0; k<projectDist[i]; k++) s[this.TERMS[i]].push(projectType);
      }
    }

    // CS 4432 (required) — earliest available term
    this._place(s, 'CS4432', ['A','B','C','D']);

    // DS 2010 (required, not A term) — earliest available
    this._place(s, 'DS2010', ['B','C','D']);

    // DS 3010 (required) — after DS 2010
    const d2010t = this._inTerm(s, 'DS2010');
    const afterD2010 = d2010t ? this.TERMS.slice(this.TERMS.indexOf(d2010t)+1) : ['C','D'];
    this._place(s, 'DS3010', afterD2010.filter(t => TERM_AVAIL[t].includes('DS3010')));

    // 2x INTL — shuffled so each generation picks a different pair
    let intlDone = 0;
    for (const id of this._shuffle(['INTL2310','INTL2210','INTL1100','INTL2410','INTL2320','INTL2510','INTL2110','INTL2910','INTL2100','INTL2420'])) {
      if (intlDone >= 2) break;
      if (this._place(s, id, this.TERMS)) intlDone++;
    }

    // HU 3900 (placeholder — not yet posted; reserves a slot in C or D)
    this._place(s, 'HU3900', ['C','D']);

    // Fill to 7+7 — shuffled so elective choices vary each run
    this._fill(s, this._shuffle(['CS4341','CS3733','CS4342','CS4343','CS4344','CS4345',
                   'CS4433','CS4445','CS4804','CS3043',
                   'EN1219','EN1251','EN1439','EN2219','EN2225','EN2251','EN3231',
                   'INTL2310','INTL2410','INTL2210','INTL2320','INTL1100','INTL2510','INTL2110','INTL2910','INTL2100','INTL2420']));

    return s;
  }

  /**
   * Generate a schedule applying your stated preferences.
   */
  generatePreferences(projectType, projectDist) {
    const s = { A:[], B:[], C:[], D:[] };

    // Place project credits
    if (projectType && projectDist) {
      for (let i=0; i<4; i++) {
        for (let k=0; k<projectDist[i]; k++) s[this.TERMS[i]].push(projectType);
      }
    }

    // Pref: CS 4341 in A
    if (this._canAdd(s, 'A', 'CS4341')) s.A.push('CS4341');

    // Pref: CS 3733 in B (best teacher)
    if (this._canAdd(s, 'B', 'CS3733')) s.B.push('CS3733');

    // CS 4342 requires CS 3733 → place in C (after B's CS 3733)
    const cs3733t = this._inTerm(s, 'CS3733');
    if (cs3733t) {
      const after = this.TERMS.slice(this.TERMS.indexOf(cs3733t)+1);
      // Pref: CS 4341→CS 4342 sequence (ideally one term after CS 4341)
      const cs4341t = this._inTerm(s, 'CS4341');
      const seqPreferred = cs4341t ? this.TERMS.slice(this.TERMS.indexOf(cs4341t)+1).filter(t => after.includes(t)) : after;
      this._place(s, 'CS4342', [...seqPreferred, ...after].filter(t => TERM_AVAIL[t].includes('CS4342')));
    }

    // CS 4345 only in D (also only offered D)
    if (this._canAdd(s, 'D', 'CS4345')) s.D.push('CS4345');

    // Required: CS 4432
    this._place(s, 'CS4432', ['A','B','C','D']);

    // Required: DS 2010
    this._place(s, 'DS2010', ['B','C','D']);

    // Required: DS 3010 after DS 2010
    const d2010t = this._inTerm(s, 'DS2010');
    const afterD = d2010t ? this.TERMS.slice(this.TERMS.indexOf(d2010t)+1) : ['C','D'];
    this._place(s, 'DS3010', afterD.filter(t => TERM_AVAIL[t].includes('DS3010')));

    // 2x INTL — shuffled so each generation picks a different pair
    let intlDone = 0;
    for (const id of this._shuffle(['INTL2310','INTL2210','INTL1100','INTL2410','INTL2320','INTL2510','INTL2110','INTL2910','INTL2100','INTL2420'])) {
      if (intlDone >= 2) break;
      if (this._place(s, id, this.TERMS)) intlDone++;
    }

    // HU 3900 (placeholder — not yet posted; reserves a slot in C or D)
    this._place(s, 'HU3900', ['C','D']);

    // Fill remaining slots — shuffled so elective choices vary each run
    this._fill(s, this._shuffle(['CS3043','CS4343','CS4344','CS4433','CS4445','CS4804',
                   'EN1219','EN1251','EN1439','EN2219','EN2225','EN2251','EN3231',
                   'INTL2510','INTL2110','INTL2310','INTL2410','INTL2210','INTL2320','INTL1100','INTL2910','INTL2100','INTL2420']));

    // Add PE to 3-class terms
    for (const t of this.TERMS) {
      if (this._reg(s, t) === 3) {
        const peList = ['WPE1012','WPE1018','WPE1019','WPE1009','WPE1011','WPE1003'];
        for (const pe of peList) {
          if (TERM_AVAIL[t].includes(pe) && !s[t].includes(pe)) {
            s[t].push(pe);
            break;
          }
        }
      }
    }

    return s;
  }

  // ── helpers ──
  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  _reg(s, term) {
    return s[term].filter(id => { const c=getCourse(id); return c && c.type!=='WPE'; }).length;
  }

  _canAdd(s, term, id) {
    return TERM_AVAIL[term].includes(id) && !this._already(s, id) && this._reg(s, term) < 4;
  }

  _already(s, id) {
    return this.TERMS.some(t => s[t].includes(id));
  }

  _inTerm(s, id) {
    return this.TERMS.find(t => s[t].includes(id)) || null;
  }

  _place(s, id, preferred) {
    if (this._already(s, id)) return true;
    for (const t of preferred) {
      if (this._canAdd(s, t, id)) { s[t].push(id); return true; }
    }
    return false;
  }

  _fill(s, candidates) {
    const target = 7;
    // Fall (A+B)
    const fallReg = () => [...s.A,...s.B].filter(id=>{const c=getCourse(id);return c&&c.type!=='WPE';}).length;
    for (const id of candidates) {
      if (fallReg() >= target) break;
      if (this._already(s, id)) continue;
      this._place(s, id, ['A','B']);
    }
    // Spring (C+D)
    const springReg = () => [...s.C,...s.D].filter(id=>{const c=getCourse(id);return c&&c.type!=='WPE';}).length;
    for (const id of candidates) {
      if (springReg() >= target) break;
      if (this._already(s, id)) continue;
      this._place(s, id, ['C','D']);
    }
  }
}

// convenience singleton
const generator = new ScheduleGenerator();
