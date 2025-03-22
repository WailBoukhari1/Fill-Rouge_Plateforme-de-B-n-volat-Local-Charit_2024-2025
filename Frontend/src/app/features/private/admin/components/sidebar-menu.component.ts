interface MenuItem {
  label: string;
  icon?: string;
  link?: string;
  expanded?: boolean;
  items?: MenuItem[];
}

const adminMenuItems: MenuItem[] = [
  {
    label: 'Users',
    icon: 'people',
    expanded: false,
    items: [
      { label: 'All Users', link: '/admin/users', icon: 'list' },
      { label: 'Volunteer Approval', link: '/admin/volunteer-approval', icon: 'verified_user' },
      { label: 'Organization Approval', link: '/admin/organization-approval', icon: 'business' }
    ]
  },
  {
    label: 'Events',
    icon: 'event',
    expanded: false,
    items: [
      { label: 'All Events', link: '/admin/events', icon: 'list' },
      { label: 'Event Approval', link: '/admin/event-approval', icon: 'fact_check' }
    ]
  },
]; 