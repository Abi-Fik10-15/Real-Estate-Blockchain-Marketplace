import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

export type NotificationEvent =
  | 'visit_request'
  | 'escrow_deposited'
  | 'transaction_completed'
  | 'property_verified'
  | 'agent_assigned'
  | 'agent_removed';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  emitVisitRequest(
    ownerId: string,
    inquiryId: string,
    propertyTitle: string,
    buyerName: string,
  ) {
    this.gateway.emitToUser(ownerId, 'visit_request', {
      inquiryId,
      propertyTitle,
      buyerName,
      message: `${buyerName} sent an inquiry for ${propertyTitle}`,
    });
  }

  emitEscrowDeposited(
    buyerId: string,
    sellerId: string,
    transactionId: string,
    amount: number,
  ) {
    const payload = {
      transactionId,
      amount,
      message: `Escrow deposit of ${amount} recorded`,
    };
    this.gateway.emitToUser(buyerId, 'escrow_deposited', payload);
    this.gateway.emitToUser(sellerId, 'escrow_deposited', payload);
  }

  emitTransactionCompleted(
    buyerId: string,
    sellerId: string,
    transactionId: string,
  ) {
    const payload = {
      transactionId,
      message: 'Transaction completed successfully',
    };
    this.gateway.emitToUser(buyerId, 'transaction_completed', payload);
    this.gateway.emitToUser(sellerId, 'transaction_completed', payload);
  }

  emitPropertyVerified(ownerId: string, propertyId: string, title: string) {
    this.gateway.emitToUser(ownerId, 'property_verified', {
      propertyId,
      title,
      message: `Listing "${title}" has been verified by an administrator`,
    });
  }

  emitAgentAssigned(
    agentId: string,
    ownerId: string,
    propertyId: string,
    title: string,
  ) {
    const payload = {
      propertyId,
      title,
      message: `You have been assigned to manage "${title}"`,
    };
    this.gateway.emitToUser(agentId, 'agent_assigned', payload);
    this.gateway.emitToUser(ownerId, 'agent_assigned', {
      ...payload,
      message: `An agent has been assigned to "${title}"`,
    });
  }

  emitAgentRemoved(
    agentId: string,
    ownerId: string,
    propertyId: string,
    title: string,
  ) {
    const payload = {
      propertyId,
      title,
      message: `You are no longer assigned to "${title}"`,
    };
    this.gateway.emitToUser(agentId, 'agent_removed', payload);
    this.gateway.emitToUser(ownerId, 'agent_removed', {
      ...payload,
      message: `The agent has been removed from "${title}"`,
    });
  }
}
