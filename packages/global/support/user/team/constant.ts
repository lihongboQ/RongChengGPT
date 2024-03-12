export const TeamCollectionName = 'teams';
export const TeamMemberCollectionName = 'team.members';

export enum TeamMemberRoleEnum {
  owner = 'owner',
  admin = 'admin',
  visitor = 'visitor'
}
export const TeamMemberRoleMap = {
  [TeamMemberRoleEnum.owner]: {
    value: TeamMemberRoleEnum.owner,
    label: 'user.team.role.Owner'
  },
  [TeamMemberRoleEnum.admin]: {
    value: TeamMemberRoleEnum.admin,
    label: 'user.team.role.Admin'
  },
  [TeamMemberRoleEnum.visitor]: {
    value: TeamMemberRoleEnum.visitor,
    label: 'user.team.role.Visitor'
  }
};

export enum TeamMemberStatusEnum {
  waiting = 'waiting',
  active = 'active',
  reject = 'reject',
  leave = 'leave'
}
export const TeamMemberStatusMap = {
  [TeamMemberStatusEnum.waiting]: {
    label: 'user.team.member.waiting',
    color: 'orange.600'
  },
  [TeamMemberStatusEnum.active]: {
    label: 'user.team.member.active',
    color: 'green.600'
  },
  [TeamMemberStatusEnum.reject]: {
    label: 'user.team.member.reject',
    color: 'red.600'
  },
  [TeamMemberStatusEnum.leave]: {
    label: 'user.team.member.leave',
    color: 'red.600'
  }
};
export const notLeaveStatus = { $ne: TeamMemberStatusEnum.leave };
