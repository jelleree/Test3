import React, { useState, useEffect } from 'react'

const PARTIES = [
  '1 PVV (Partij voor de Vrijheid)',
  '2 GROENLINKS / Partij van de Arbeid (PvdA)',
  '3 VVD',
  '4 Nieuw Sociaal Contract (NSC)',
  '5 D66',
  '6 BBB',
  '7 CDA',
  '8 SP (Socialistische Partij)',
  '9 DENK',
  '10 Partij voor de Dieren',
  '11 Forum voor Democratie',
  '12 Staatkundig Gereformeerde Partij (SGP)',
  '13 ChristenUnie',
  '14 Volt',
  '15 JA21',
  '16 Vrede voor Dieren',
  '17 Belang Van Nederland (BVNL)',
  '18 BIJ1',
  '19 LP (Libertaire Partij)',
  '20 50PLUS',
  '21 Piratenpartij',
  '22 FNP',
  '23 Vrij Verbond',
  '24 DE LINIE',
  '25 NL PLAN',
  '26 ELLECT',
  '27 Partij voor de Rechtsstaat'
]

const STORAGE_KEY = 'verkiezingspool_predictions_v1'
const RESULT_KEY = 'verkiezingspool_results_v1'
const REVEAL_DEADLINE = new Date('2025-10-29T20:00:00+02:00')

export default function Verkiezingspool2025() {
  const [name, setName] = useState('')
  const [inputs, setInputs] = useState(() => initializeEmpty())
  const [predictions, setPredictions] = useState(loadAllPredictions())
  const [results, setResults] = useState(loadResults())
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  function initializeEmpty() {
    const obj = {}
    PARTIES.forEach(p => (obj[p] = ''))
    return obj
  }

  function updateInput(party, value) {
    if (!/^[0-9]*$/.test(value)) return
    setInputs(prev => ({ ...prev, [party]: value }))
  }

  function totalSeats() {
    return PARTIES.reduce((s, p) => s + (Number(inputs[p] || 0)), 0)
  }

  function validateAndSave() {
    const tot = totalSeats()
    if (tot !== 150) {
      alert('Het totaal van alle zetels moet precies 150 zijn. Nu: ' + tot)
      return
    }
    if (!name.trim()) {
      alert('Vul eerst je naam in.')
      return
    }
    const all = loadAllPredictions()
    all[name.trim()] = { name: name.trim(), picks: { ...inputs }, savedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    setPredictions(all)
    alert('Voorspelling opgeslagen!')
  }

  function loadAllPredictions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function loadResults() {
    try {
      const raw = localStorage.getItem(RESULT_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function saveResults() {
    const tot = PARTIES.reduce((s, p) => s + (Number(results[p] || 0)), 0)
    if (tot !== 150) {
      alert('Het totaal van de uitslag moet 150 zijn.')
      return
    }
    localStorage.setItem(RESULT_KEY, JSON.stringify(results))
    alert('Officiële uitslag opgeslagen.')
  }

  function computeScores() {
    if (!results) return {}
    const all = loadAllPredictions()
    const scores = {}
    Object.values(all).forEach(user => {
      let score = 0
      PARTIES.forEach(p => {
        if (Number(user.picks[p] || 0) === Number(results[p] || 0)) score += 1
      })
      scores[user.name] = { name: user.name, score }
    })
    return scores
  }

  const revealAllowed = now >= REVEAL_DEADLINE

  return (
    <div className="p-4 max-w-5xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-2">Verkiezingspool Tweede Kamer 2025</h1>
      <p className="mb-4">Voorspel de zetelverdeling. Inzendingen blijven geheim tot woensdag 29 oktober 2025, 20:00 uur.</p>

      <section className="mb-6 p-4 border rounded-lg">
        <h2 className="font-semibold mb-2">Jouw voorspelling</h2>
        <label className="block mb-2">Naam:</label>
        <input value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded w-full mb-3" placeholder="Bijv. Sara" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-auto mb-3">
          {PARTIES.map(p => (
            <div key={p} className="p-2 border rounded">
              <div className="text-sm mb-1">{p}</div>
              <input value={inputs[p]} onChange={e => updateInput(p, e.target.value)} placeholder="0" className="w-full p-1 border rounded" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div>Totaal: <strong>{totalSeats()}</strong>/150</div>
          <button onClick={validateAndSave} className="px-3 py-1 bg-blue-600 text-white rounded">Opslaan</button>
        </div>
      </section>

      <section className="mb-6 p-4 border rounded-lg">
        <h2 className="font-semibold mb-2">Leaderboard & Scores</h2>
        {!revealAllowed ? (
          <div className="p-3 bg-yellow-50 border rounded">Voorspellingen zijn geheim tot 29 oktober 2025, 20:00 uur.</div>
        ) : (
          <div className="overflow-auto max-h-96 p-2">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-1">Naam</th>
                  {PARTIES.map(p => <th key={p} className="border p-1 text-xs">{p}</th>)}
                </tr>
              </thead>
              <tbody>
                {Object.values(predictions).map(u => (
                  <tr key={u.name}>
                    <td className="border p-1"><strong>{u.name}</strong></td>
                    {PARTIES.map(p => <td key={p} className="border p-1 text-center">{u.picks[p] ?? 0}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {results && (
          <div className="mt-4">
            <h3 className="font-semibold">Scores</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr><th className="border p-1">Naam</th><th className="border p-1">Score</th></tr>
              </thead>
              <tbody>
                {Object.values(computeScores()).sort((a,b)=>b.score-a.score).map(s => (
                  <tr key={s.name}><td className="border p-1">{s.name}</td><td className="border p-1 text-center">{s.score}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
