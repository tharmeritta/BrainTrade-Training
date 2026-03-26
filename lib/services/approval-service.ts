import { fsAdd, fsUpdate, fsDelete, fsGet, fsSet } from '@/lib/firestore-db';
import type { ApprovalRequest, ApprovalActionType } from '@/types';

export async function createApprovalRequest(
  requester: { uid: string; name: string },
  actionType: ApprovalActionType,
  data: any,
  target?: { id?: string; name?: string }
) {
  const request: Omit<ApprovalRequest, 'id' | 'createdAt'> = {
    requesterId: requester.uid,
    requesterName: requester.name,
    actionType,
    data,
    targetId: target?.id,
    targetName: target?.name,
    status: 'pending',
  };

  return await fsAdd('approval_requests', request);
}

export async function resolveApprovalRequest(
  requestId: string,
  admin: { uid: string; name: string },
  status: 'approved' | 'rejected',
  rejectionReason?: string
) {
  const request = await fsGet<ApprovalRequest>('approval_requests', requestId);
  if (!request || request.status !== 'pending') {
    throw new Error('Request not found or already resolved');
  }

  if (request.requesterId === admin.uid) {
    throw new Error('Self-approval is not allowed');
  }

  const update: Partial<ApprovalRequest> = {
    status,
    resolvedAt: new Date().toISOString(),
    resolvedBy: admin.uid,
    resolvedByName: admin.name,
    rejectionReason,
  };

  await fsUpdate('approval_requests', requestId, update);

  if (status === 'approved') {
    await executeApprovedAction(request);
  }

  return { ...request, ...update };
}

async function executeApprovedAction(request: ApprovalRequest) {
  const { actionType, data, targetId } = request;

  switch (actionType) {
    case 'create_staff':
      await fsAdd('staff_accounts', data);
      break;
    case 'edit_staff':
      if (targetId) await fsUpdate('staff_accounts', targetId, data);
      break;
    case 'delete_staff':
      if (targetId) await fsDelete('staff_accounts', targetId);
      break;
    case 'toggle_staff':
      if (targetId) await fsUpdate('staff_accounts', targetId, { active: data.active });
      break;
    case 'update_config':
      // data should be { key: string, payload: any }
      await fsSet('module_config', data.key, data.payload);
      break;
    case 'create_agent':
      await fsAdd('agents', data);
      break;
    case 'edit_agent':
      if (targetId) await fsUpdate('agents', targetId, data);
      break;
    case 'delete_agent':
      if (targetId) await fsDelete('agents', targetId);
      break;
    case 'toggle_agent':
      if (targetId) await fsUpdate('agents', targetId, { active: data.active });
      break;
  }
}
