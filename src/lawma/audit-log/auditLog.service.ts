import { AuditLog, AuditLogSchema } from '@models/audit-log.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async logAction(user, req: Request, action:string) {
    const platform = req.headers['user-agent'] || '';
    let ipAddress =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      '';
    if (ipAddress.startsWith('::ffff:')) {
      ipAddress = '';
    }

    return this.auditLogModel.create({
      userId: user.id,
      name: user.name,
      email: user.email,
      action: action,
      platform,
      ipAddress,
    });
  }

  async getAllLogs({ search, startDate, endDate, page = '1', limit = '10' }) {
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
    const skip = (Number(page) - 1) * Number(limit);
    return this.auditLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
  }

  async getLogDetails(id: string) {
    return this.auditLogModel.findById(id).populate('userId', 'name email');
  }
}
