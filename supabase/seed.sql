-- Curated destinations along the launch circuits. Coordinates are (lng, lat).
insert into public.places (name, circuit, geo) values
  ('Manali',      'Himachal',    'SRID=4326;POINT(77.1892 32.2432)'),
  ('Kasol',       'Himachal',    'SRID=4326;POINT(77.3150 32.0100)'),
  ('Tosh',        'Himachal',    'SRID=4326;POINT(77.4500 32.0167)'),
  ('Bir',         'Himachal',    'SRID=4326;POINT(76.7210 32.0440)'),
  ('McLeod Ganj', 'Himachal',    'SRID=4326;POINT(76.3213 32.2426)'),
  ('Jibhi',       'Himachal',    'SRID=4326;POINT(77.3610 31.5870)'),
  ('Shimla',      'Himachal',    'SRID=4326;POINT(77.1734 31.1048)'),
  ('Kaza (Spiti)','Himachal',    'SRID=4326;POINT(78.0710 32.2276)'),
  ('Rishikesh',   'Uttarakhand', 'SRID=4326;POINT(78.2676 30.0869)'),
  ('Dehradun',    'Uttarakhand', 'SRID=4326;POINT(78.0322 30.3165)'),
  ('Mussoorie',   'Uttarakhand', 'SRID=4326;POINT(78.0644 30.4598)'),
  ('Nainital',    'Uttarakhand', 'SRID=4326;POINT(79.4542 29.3919)'),
  ('Kasar Devi',  'Uttarakhand', 'SRID=4326;POINT(79.6710 29.6180)'),
  ('Chopta',      'Uttarakhand', 'SRID=4326;POINT(79.0340 30.3470)'),
  ('Auli',        'Uttarakhand', 'SRID=4326;POINT(79.5663 30.5286)'),
  ('Kedarnath',   'Uttarakhand', 'SRID=4326;POINT(79.0669 30.7346)'),
  ('Panjim',      'Goa',         'SRID=4326;POINT(73.8278 15.4909)'),
  ('Calangute',   'Goa',         'SRID=4326;POINT(73.7553 15.5439)'),
  ('Anjuna',      'Goa',         'SRID=4326;POINT(73.7407 15.5733)'),
  ('Vagator',     'Goa',         'SRID=4326;POINT(73.7340 15.6030)'),
  ('Morjim',      'Goa',         'SRID=4326;POINT(73.7310 15.6230)'),
  ('Arambol',     'Goa',         'SRID=4326;POINT(73.7040 15.6860)'),
  ('Palolem',     'Goa',         'SRID=4326;POINT(74.0230 15.0100)')
on conflict (name) do nothing;

insert into public.prompts (text, placeholder, category) values
  ('My ideal stay in the hills looks like...',        'A tiny homestay, chai at 6am, no wifi',          'travel-style'),
  ('The trek I keep telling people about...',         'Kheerganga in the rain, zero regrets',            'travel-style'),
  ('On a travel day you will find me...',             'Window seat, offline playlist, too many snacks', 'travel-style'),
  ('My non-negotiable on a trip...',                  'At least one sunrise',                           'travel-style'),
  ('I am looking for a buddy who...',                 'Is fine with 4am starts and slow cafe afternoons', 'about-me'),
  ('Two truths and a lie from the road...',           'I got lost in Spiti, I can cook Maggi on a stove, I love buses', 'about-me'),
  ('The worst travel decision I would make again...', 'Taking the overnight HRTC bus',                  'about-me'),
  ('My split-the-bill philosophy...',                 'Split everything, settle on Splitwise same day', 'logistics'),
  ('I usually sleep in...',                           'Dorms, but I will splurge on a view',            'logistics'),
  ('Work-from-mountains setup...',                    'Laptop, power bank, a cafe with a backup inverter', 'logistics')
on conflict (text) do nothing;
