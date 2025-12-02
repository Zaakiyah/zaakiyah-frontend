export interface ImpactStory {
	id: number;
	title: string;
	content: string;
	image?: string;
	author: {
		name: string;
		role: string;
		avatar: string;
		avatarColor: string;
	};
	stats?: {
		label: string;
		value: string;
	};
	date: string;
}

export const impactStories: ImpactStory[] = [
	{
		id: 1,
		title: 'Education for All',
		content:
			'Through your Zakaat donations, we were able to provide educational support to 50 children in need, ensuring they have access to quality education and learning materials.',
		author: {
			name: 'Ahmed Kola',
			role: 'Student',
			avatar: 'AK',
			avatarColor: 'bg-primary-600',
		},
		stats: {
			label: 'Children Supported',
			value: '50',
		},
		date: '2024-01-15',
	},
	{
		id: 2,
		title: 'Healthcare Support',
		content:
			'Your contributions helped provide medical assistance to families facing health challenges, covering treatment costs and ensuring access to necessary healthcare services.',
		author: {
			name: 'Fatima Ibrahim',
			role: 'Beneficiary',
			avatar: 'FI',
			avatarColor: 'bg-slate-800',
		},
		stats: {
			label: 'Families Helped',
			value: '25',
		},
		date: '2024-01-10',
	},
	{
		id: 3,
		title: 'Food Security',
		content:
			'During difficult times, your Sadaqah helped provide food assistance to over 200 families, ensuring they had access to nutritious meals.',
		author: {
			name: 'Musa Abdullahi',
			role: 'Community Leader',
			avatar: 'MA',
			avatarColor: 'bg-primary-600',
		},
		stats: {
			label: 'Families Fed',
			value: '200+',
		},
		date: '2024-01-05',
	},
	{
		id: 4,
		title: 'Clean Water Initiative',
		content:
			'Your donations helped install clean water systems in 3 communities, providing access to safe drinking water for over 500 people.',
		author: {
			name: 'Amina Hassan',
			role: 'Project Coordinator',
			avatar: 'AH',
			avatarColor: 'bg-primary-500',
		},
		stats: {
			label: 'People Served',
			value: '500+',
		},
		date: '2024-01-01',
	},
];

