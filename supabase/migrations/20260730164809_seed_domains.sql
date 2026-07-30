insert into domains (name_fr, name_ar)
values
  ('Sciences et Technologies', 'علوم وتكنولوجيا'),
  ('Sciences de la Nature et de la Vie', 'علوم الطبيعة والحياة'),
  ('Sciences Humaines et Sociales', 'العلوم الإنسانية والاجتماعية'),
  ('Droit et Sciences Politiques', 'الحقوق والعلوم السياسية'),
  ('Sciences Économiques et Gestion', 'العلوم الاقتصادية والتسيير'),
  ('Lettres et Langues', 'الآداب واللغات'),
  ('Médecine et Sciences de la Santé', 'الطب والعلوم الصحية'),
  ('Mathématiques et Informatique', 'الرياضيات والإعلام الآلي')
on conflict (name_fr) do nothing;
