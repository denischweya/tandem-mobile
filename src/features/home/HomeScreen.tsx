import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  ListRow,
  MemberList,
  PlusIcon,
  PlanCard,
  ResponsiveContainer,
  TabBar,
  HomeTabIcon,
  PlansTabIcon,
  PeopleTabIcon,
  GroupsTabIcon,
  ProfileTabIcon,
  type AvatarGroupMember,
  type MemberListPerson,
  type TabBarItem,
} from '@/components';
import { colors, headingStyle, labelStyle, spacing, sizes, subStyle } from '@/theme';
import {
  getHomeDashboardFixture,
  mockNow,
  personAvatarColor,
  personAvatarTextColor,
} from './fixtures';
import {
  formatGreeting,
  formatHeaderDate,
  formatRelativeDays,
  formatScheduleLine,
} from './formatting';

const TAB_ITEMS: TabBarItem[] = [
  { id: 'home', label: 'Home', Icon: HomeTabIcon },
  { id: 'plans', label: 'Plans', Icon: PlansTabIcon },
  { id: 'people', label: 'People', Icon: PeopleTabIcon },
  { id: 'groups', label: 'Groups', Icon: GroupsTabIcon },
  { id: 'profile', label: 'Profile', Icon: ProfileTabIcon },
];

/**
 * Screen 3a of the design handoff: "Home: next plan, what needs you, your people". Pure
 * composition - every visual primitive it uses lives in `src/components`, every token comes
 * from `src/theme`, every value comes from the `src/features/home/fixtures.ts` mock (there is
 * no Home API endpoint yet) and `src/features/home/formatting.ts` (which does the real
 * `toZonedParts` work the date/time text on screen needs).
 */
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const data = getHomeDashboardFixture(mockNow);
  const { nextPlan } = data;

  const attendees: AvatarGroupMember[] = nextPlan.attendees.map((attendee) => ({
    id: attendee.id,
    label: attendee.initials,
    backgroundColor: personAvatarColor[attendee.id] ?? colors.neutral[300],
    textColor: personAvatarTextColor[attendee.id],
  }));
  const attendeesLabel = `${nextPlan.attendees.length} attending: ${nextPlan.attendees
    .map((attendee) => attendee.firstName)
    .join(', ')}`;

  const people: MemberListPerson[] = data.people.map((person) => ({
    id: person.id,
    firstName: person.firstName,
    initials: person.initials,
    avatarColor: personAvatarColor[person.id] ?? colors.neutral[300],
    avatarTextColor: personAvatarTextColor[person.id],
    availability: person.availability,
  }));

  return (
    <ResponsiveContainer>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xxxl,
          paddingHorizontal: spacing.xxxl,
          paddingBottom: sizes.tabBarHeight + insets.bottom + spacing.huge,
          gap: spacing.huge,
        }}
      >
        <View style={{ gap: 4 }}>
          <Text style={subStyle}>{formatHeaderDate(data.now, data.timeZone)}</Text>
          <Text accessibilityRole="header" style={headingStyle(34)}>
            {formatGreeting(data.now, data.timeZone)}, {data.currentUserFirstName}
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <Text style={labelStyle}>Your next plan</Text>
          <PlanCard
            title={nextPlan.title}
            scheduleLine={formatScheduleLine(
              nextPlan.startsAt,
              nextPlan.timeZone,
              nextPlan.location,
            )}
            relativeLabel={formatRelativeDays(data.now, nextPlan.startsAt, nextPlan.timeZone)}
            attendees={attendees}
            attendeesLabel={attendeesLabel}
            inCalendar={nextPlan.inCalendar}
          />
        </View>

        <View style={{ gap: spacing.xxs }}>
          <Text style={labelStyle}>Needs you</Text>
          {data.needsYou.map((item) => (
            <ListRow
              key={item.id}
              leading={
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.accent[500],
                  }}
                />
              }
              title={item.title}
              subtitle={item.subtitle}
            />
          ))}
        </View>

        <MemberList title="Your people this week" people={people} />
      </ScrollView>

      <Button
        label="Make a plan"
        icon={<PlusIcon size={sizes.plusIcon} color={colors.bg} />}
        // No Create Plan screen exists in this slice yet (Home dashboard only) - the use
        // case is already in the architecture (docs/specs/.../§8 Plans endpoints), just not
        // sequenced into this plan. Left as a no-op rather than invented navigation, per the
        // task constraint against inventing API/navigation nothing calls.
        onPress={() => {}}
        style={{ position: 'absolute', right: 20, bottom: sizes.tabBarHeight + insets.bottom + 20 }}
      />

      <TabBar items={TAB_ITEMS} activeId="home" bottomInset={insets.bottom} />
    </ResponsiveContainer>
  );
}
