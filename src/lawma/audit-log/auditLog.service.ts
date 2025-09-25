import { AuditLog, AuditLogSchema } from '@models/audit-log.model';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';

import { Request } from 'express';
import { Model } from 'mongoose';
import { AuditLogEvents, LogActionEvent } from './dto/event';
import { Administrator } from '@models/administrator.model';
import { log } from 'console';
import { logStatement } from './dto/auditLog.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
    @InjectModel(Administrator.name) private adminModel: Model<Administrator>,
  ) {}

  @OnEvent(AuditLogEvents.UserActivity)
  async logAction(event: LogActionEvent) {
    const { userId, req, action } = event.data;

    const platform = req.headers['user-agent'] || '';

    let ipAddress =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      '';

    const user = await this.adminModel.findById(userId);

    return this.auditLogModel.create({
      user: user._id,
      name: user.name,
      email: user.email,
      action: action,
      platform,
      ipAddress,
    });
  }

  async getAllLogs({ search, startDate, endDate, activityType, role, page = '1', limit = '10' }) {
    const query: any = {};
    // Search by action, platform, or ipAddress
    if (search) {
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { platform: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
      ];
    }
    // Date range filter
    if (startDate || endDate) {
      query['createdAt'] = {};
      if (startDate) query['timestamp']['$gte'] = new Date(startDate);
      if (endDate) query['timestamp']['$lte'] = new Date(endDate);
    }

    if(activityType){
      query['action'] = activityType;
    }
    if(role){
      query['role'] = role; 
    }
    const skip = (Number(page) - 1) * Number(limit);
    return this.auditLogModel
      .find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean()
      .then((logs) =>
        logs.map((log) => ({
          ...log,
          action: logStatement[log.action],
        })),
      );
  }

  async getLogDetails(id: string) {
    return this.auditLogModel
      .findById(id)
      .populate('user', 'name email role')
      .lean()
      .then(
        (log) =>
          log && {
            ...log,
           action: logStatement[log.action],
          },
      );
  }
}
