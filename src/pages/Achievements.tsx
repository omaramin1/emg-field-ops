// Gamification - achievements, streaks, and motivation
import { useState } from 'react'
import { Trophy, Flame, Target, Zap } from 'lucide-react'

export default function AchievementsPage() {
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'streaks'>('achievements')
  
  // Mock data
  const achievements = [
    { id: 'first_signup', name: 'First Blood', description: 'Get your first signup', icon: '🎯', unlocked: true, date: 'Jan 15' },
    { id: 'ten_signups', name: 'Double Digits', description: 'Get 10 signups', icon: '🔥', unlocked: true, date: 'Jan 18' },
    { id: 'fifty_signups', name: 'Closer', description: 'Get 50 signups', icon: '💪', unlocked: true, date: 'Jan 23' },
    { id: 'hundred_signups', name: 'Centurion', description: 'Get 100 signups', icon: '🏆', unlocked: false, progress: 67 },
    { id: 'hundred_doors', name: 'Iron Legs', description: 'Knock 100 doors in a day', icon: '🦵', unlocked: false, progress: 87 },
    { id: 'five_day_streak', name: 'Consistent', description: '5-day signup streak', icon: '📈', unlocked: true, date: 'Jan 20' },
    { id: 'ten_day_streak', name: 'Machine', description: '10-day signup streak', icon: '🤖', unlocked: false, progress: 70 },
    { id: 'perfect_day', name: 'Perfect Day', description: '10+ signups in one day', icon: '⭐', unlocked: false, progress: 50 },
    { id: 'early_bird', name: 'Early Bird', description: 'First signup before 10am', icon: '🌅', unlocked: true, date: 'Jan 22' },
    { id: 'shark', name: 'Shark', description: '50%+ close rate (min 10 qualified)', icon: '🦈', unlocked: true, date: 'Jan 24' },
    { id: 'territory_clear', name: 'Cleared It', description: 'Complete an entire territory', icon: '🗺️', unlocked: false, progress: 84 },
    { id: 'thousand_dollars', name: '$1K Week', description: 'Earn $1,000 in a week', icon: '💰', unlocked: false, progress: 85 },
  ]

  const streakData = {
    current: 7,
    longest: 12,
    thisWeek: [true, true, true, true, true, false, false], // Mon-Sun
    bonus: {
      next: 10,
      reward: '$50 bonus'
    }
  }

  const milestones = [
    { signups: 100, reward: '$100 bonus', progress: 67 },
    { signups: 250, reward: 'Day off + $150', progress: 27 },
    { signups: 500, reward: 'Weekend trip', progress: 13 },
    { signups: 1000, reward: '$1,000 bonus', progress: 7 },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div>
      <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        🏆 Achievements
      </div>

      {/* Stats Summary */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          {unlockedCount}/{totalCount}
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>Achievements Unlocked</div>
        <div style={{ 
          marginTop: '1rem',
          height: '8px',
          background: 'var(--bg-card)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${(unlockedCount / totalCount) * 100}%`,
            background: 'linear-gradient(90deg, var(--accent), #fbbf24)'
          }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        background: 'var(--bg-secondary)', 
        borderRadius: '0.75rem',
        padding: '0.25rem',
        marginBottom: '1rem'
      }}>
        <button
          onClick={() => setSelectedTab('achievements')}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: selectedTab === 'achievements' ? 'var(--accent)' : 'transparent',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'var(--text-primary)',
            fontWeight: selectedTab === 'achievements' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Trophy size={18} />
          Badges
        </button>
        <button
          onClick={() => setSelectedTab('streaks')}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: selectedTab === 'streaks' ? 'var(--accent)' : 'transparent',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'var(--text-primary)',
            fontWeight: selectedTab === 'streaks' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Flame size={18} />
          Streaks
        </button>
      </div>

      {selectedTab === 'achievements' ? (
        <>
          {/* Achievement Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '1rem 0.5rem',
                  opacity: achievement.unlocked ? 1 : 0.5,
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
                  {achievement.icon}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {achievement.name}
                </div>
                {achievement.unlocked ? (
                  <div style={{ fontSize: '0.625rem', color: 'var(--accent)', marginTop: '0.25rem' }}>
                    ✓ {achievement.date}
                  </div>
                ) : achievement.progress ? (
                  <div style={{ marginTop: '0.25rem' }}>
                    <div style={{ 
                      height: '4px', 
                      background: 'var(--bg-card)', 
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${achievement.progress}%`,
                        background: 'var(--accent)'
                      }} />
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                      {achievement.progress}%
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div className="card">
            <div className="card-title">
              <Target size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Milestone Bonuses
            </div>
            
            {milestones.map((milestone, index) => (
              <div 
                key={milestone.signups}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 0',
                  borderBottom: index < milestones.length - 1 ? '1px solid var(--bg-card)' : 'none'
                }}
              >
                <div style={{ 
                  width: '48px',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: milestone.progress >= 100 ? 'var(--accent)' : 'var(--text-secondary)'
                }}>
                  {milestone.signups}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{milestone.reward}</div>
                  <div style={{ 
                    height: '6px', 
                    background: 'var(--bg-card)', 
                    borderRadius: '3px',
                    marginTop: '0.5rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${milestone.progress}%`,
                      background: 'var(--accent)'
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {milestone.progress}%
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Current Streak */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem' }}>🔥</div>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: '#fbbf24' }}>
              {streakData.current} Days
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Current Streak
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div 
                  key={index}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: streakData.thisWeek[index] ? 'var(--accent)' : 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  {streakData.thisWeek[index] ? '✓' : day}
                </div>
              ))}
            </div>

            <div style={{ 
              padding: '0.75rem', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <Zap size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#fbbf24' }} />
              {streakData.bonus.next - streakData.current} more days for {streakData.bonus.reward}!
            </div>
          </div>

          {/* Streak Stats */}
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{streakData.longest}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Longest Streak</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>23</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Streak Days</div>
              </div>
            </div>
          </div>

          {/* Streak Rewards */}
          <div className="card">
            <div className="card-title">Streak Rewards</div>
            
            {[
              { days: 5, reward: '$25 bonus', reached: true },
              { days: 10, reward: '$50 bonus', reached: false, current: true },
              { days: 20, reward: '$100 bonus', reached: false },
              { days: 30, reward: 'Day off + $150', reached: false },
            ].map((reward, index) => (
              <div 
                key={reward.days}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 0',
                  borderBottom: index < 3 ? '1px solid var(--bg-card)' : 'none',
                  opacity: reward.reached ? 1 : 0.7
                }}
              >
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%',
                  background: reward.reached ? 'var(--accent)' : reward.current ? '#fbbf24' : 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  {reward.reached ? '✓' : reward.current ? '🔥' : reward.days}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{reward.days}-Day Streak</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{reward.reward}</div>
                </div>
                {reward.current && (
                  <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>
                    {reward.days - streakData.current} to go!
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
