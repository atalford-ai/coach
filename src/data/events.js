export const EVENT_CATEGORIES = {
  sprints:      { label: 'Sprints',         events: ['50m','55m','60m','100m','200m'] },
  middle:       { label: 'Middle Distance',  events: ['400m','600m','800m','1000m','1500m','1600m','Mile'] },
  distance:     { label: 'Distance',         events: ['3000m','3200m','2 Mile','5000m','5K','10000m','10K'] },
  hurdles:      { label: 'Hurdles',          events: ['55m Hurdles','60m Hurdles','100m Hurdles','110m Hurdles','300m Hurdles','400m Hurdles'] },
  relays:       { label: 'Relays',           events: ['4x100m','4x200m','4x400m','Sprint Medley','Distance Medley'] },
  field:        { label: 'Field',            events: ['High Jump','Long Jump','Triple Jump','Pole Vault','Shot Put','Discus','Javelin','Hammer'] },
  combined:     { label: 'Combined',         events: ['Pentathlon','Heptathlon','Decathlon'] },
  cross_country:{ label: 'Cross Country',    events: ['3K XC','4K XC','5K XC','6K XC','8K XC','10K XC'] },
};

export const ALL_EVENTS = Object.values(EVENT_CATEGORIES).flatMap(c => c.events);
