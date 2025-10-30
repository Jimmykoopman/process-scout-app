import { JourneyData } from '@/types/journey';

export const sampleJourneyData: JourneyData = {
  stages: [
    {
      id: '1',
      label: 'Bewustzijn',
      shape: 'circle',
      color: '#0891B2',
      details: 'De fase waarin klanten bewust worden van uw product of dienst',
      children: [
        {
          id: '1.1',
          label: 'Online marketing',
          shape: 'circle',
          children: [
            { id: '1.1.1', label: 'Zoekmachine', shape: 'circle' },
            { id: '1.1.2', label: 'Social media', shape: 'circle' },
            { id: '1.1.3', label: 'Email', shape: 'circle' },
          ],
        },
        {
          id: '1.2',
          label: 'Betaalde content',
          shape: 'circle',
        },
      ],
    },
    {
      id: '2',
      label: 'Overweging',
      shape: 'circle',
      color: '#7C3AED',
      details: 'Klanten vergelijken opties en evalueren uw aanbod',
      children: [
        {
          id: '2.1',
          label: 'Website',
          shape: 'circle',
        },
        {
          id: '2.2',
          label: 'Direct mail',
          shape: 'circle',
        },
      ],
    },
    {
      id: '3',
      label: 'Aankoop',
      shape: 'circle',
      color: '#0EA5E9',
      details: 'De klant besluit om te kopen',
      children: [
        {
          id: '3.1',
          label: 'Webshop',
          shape: 'circle',
        },
        {
          id: '3.2',
          label: 'App',
          shape: 'circle',
        },
        {
          id: '3.3',
          label: 'Telefoon',
          shape: 'circle',
        },
      ],
    },
    {
      id: '4',
      label: 'Service',
      shape: 'circle',
      color: '#10B981',
      details: 'Support en service na de aankoop',
      children: [
        {
          id: '4.1',
          label: 'Klantenservice',
          shape: 'circle',
          children: [
            {
              id: '4.1.1',
              label: 'Product vragen',
              shape: 'circle',
              children: [
                {
                  id: '4.1.1.1',
                  label: 'Sharptool 1.0',
                  shape: 'circle',
                  children: [
                    { id: '4.1.1.1.1', label: 'Maatvoeringen', shape: 'circle', details: 'Technische specificaties en afmetingen' },
                    { id: '4.1.1.1.2', label: 'Gebruiksaanwijzing', shape: 'circle', details: 'Handleiding voor gebruik' },
                    { id: '4.1.1.1.3', label: 'Garantie', shape: 'circle', details: '2 jaar fabrieksgarantie' },
                  ],
                },
                {
                  id: '4.1.1.2',
                  label: 'Sharptool 2.0',
                  shape: 'circle',
                  children: [
                    { id: '4.1.1.2.1', label: 'Maatvoeringen', shape: 'circle', details: 'Verbeterde specificaties en afmetingen' },
                    { id: '4.1.1.2.2', label: 'Gebruiksaanwijzing', shape: 'circle', details: 'Uitgebreide handleiding met video tutorials' },
                    { id: '4.1.1.2.3', label: 'Garantie', shape: 'circle', details: '3 jaar fabrieksgarantie + optionele uitbreiding' },
                  ],
                },
              ],
            },
            {
              id: '4.1.2',
              label: 'Bestelling vragen',
              shape: 'circle',
            },
          ],
        },
        {
          id: '4.2',
          label: 'Chat',
          shape: 'circle',
        },
        {
          id: '4.3',
          label: 'Telefoon',
          shape: 'circle',
        },
      ],
    },
    {
      id: '5',
      label: 'Loyaliteit',
      shape: 'circle',
      color: '#D97706',
      details: 'Klantbehoud en herhaalaankopen',
      children: [
        {
          id: '5.1',
          label: 'Email',
          shape: 'circle',
        },
        {
          id: '5.2',
          label: 'Klantenonderzoek',
          shape: 'circle',
        },
      ],
    },
  ],
};
