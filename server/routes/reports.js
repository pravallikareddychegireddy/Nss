const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Event = require('../models/Event');
const Participation = require('../models/Participation');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Generate event report PDF
router.get('/event/:id/pdf', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('coordinatorId facultyInCharge');
    const participations = await Participation.find({ eventId: req.params.id, status: 'approved' })
      .populate('studentId', 'name rollNumber department');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=event-report-${event.title}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('NSS Event Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(event.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`);
    doc.text(`Venue: ${event.venue}`);
    doc.text(`Category: ${event.category}`);
    doc.text(`Coordinator: ${event.coordinatorId.name}`);
    doc.text(`Total Participants: ${participations.length}`);
    doc.moveDown();
    doc.fontSize(14).text('Participants:', { underline: true });
    doc.moveDown();

    participations.forEach((p, index) => {
      doc.fontSize(10).text(`${index + 1}. ${p.studentId.name} (${p.studentId.rollNumber}) - ${p.studentId.department}`);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate attendance list PDF for an event
router.get('/attendance-list/:id', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('coordinatorId');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get all participations (pending, attended, approved)
    const participations = await Participation.find({ 
      eventId: req.params.id,
      status: { $in: ['pending', 'attended', 'approved'] }
    }).populate('studentId', 'name rollNumber department year phone email');

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${event.title.replace(/\s+/g, '-')}.pdf`);
    doc.pipe(res);

    // Header with NSS branding
    doc.fontSize(24).fillColor('#FF6600').text('NSS - Vignan University', { align: 'center' });
    doc.fontSize(12).fillColor('#000000').text('National Service Scheme', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).fillColor('#138808').text('Event Attendance List', { align: 'center' });
    doc.moveDown();

    // Event Details
    doc.fontSize(12).fillColor('#000000');
    doc.text(`Event: ${event.title}`, { bold: true });
    doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`);
    doc.text(`Venue: ${event.venue}`);
    doc.text(`Coordinator: ${event.coordinatorId.name}`);
    doc.text(`Total Registered: ${participations.length}`);
    doc.moveDown();

    // Table Header
    doc.fontSize(10).fillColor('#FFFFFF');
    const tableTop = doc.y;
    doc.rect(50, tableTop, 500, 25).fillAndStroke('#FF6600', '#FF6600');
    doc.text('S.No', 60, tableTop + 8, { width: 40 });
    doc.text('Name', 100, tableTop + 8, { width: 120 });
    doc.text('Roll No', 220, tableTop + 8, { width: 80 });
    doc.text('Department', 300, tableTop + 8, { width: 100 });
    doc.text('Status', 400, tableTop + 8, { width: 80 });
    doc.text('Signature', 480, tableTop + 8, { width: 70 });

    // Table Rows
    let yPosition = tableTop + 30;
    doc.fillColor('#000000');

    participations.forEach((p, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      const bgColor = index % 2 === 0 ? '#F5F5F5' : '#FFFFFF';
      doc.rect(50, yPosition, 500, 25).fillAndStroke(bgColor, '#CCCCCC');
      
      doc.fillColor('#000000');
      doc.fontSize(9);
      doc.text(`${index + 1}`, 60, yPosition + 8, { width: 40 });
      doc.text(p.studentId.name, 100, yPosition + 8, { width: 120 });
      doc.text(p.studentId.rollNumber || 'N/A', 220, yPosition + 8, { width: 80 });
      doc.text(p.studentId.department || 'N/A', 300, yPosition + 8, { width: 100 });
      
      // Status badge
      const statusColor = p.status === 'approved' ? '#138808' : p.status === 'attended' ? '#0066CC' : '#FF9933';
      doc.fillColor(statusColor);
      doc.text(p.status.toUpperCase(), 400, yPosition + 8, { width: 80 });
      
      yPosition += 25;
    });

    // Footer
    doc.fontSize(10).fillColor('#666666');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.page.height - 50, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Attendance list error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate annual summary Excel
router.get('/annual-summary/excel', protect, authorize('admin'), async (req, res) => {
  try {
    const { year } = req.query;
    const startDate = new Date(`${year || new Date().getFullYear()}-01-01`);
    const endDate = new Date(`${year || new Date().getFullYear()}-12-31`);

    const events = await Event.find({
      date: { $gte: startDate, $lte: endDate }
    });

    const students = await User.find({ role: 'student' });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('NSS Annual Summary');

    worksheet.columns = [
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Total Hours', key: 'totalHours', width: 15 },
      { header: 'Events Participated', key: 'eventsCount', width: 20 }
    ];

    for (const student of students) {
      const participations = await Participation.find({
        studentId: student._id,
        status: 'approved'
      }).populate('eventId');

      const relevantParticipations = participations.filter(p => 
        p.eventId && p.eventId.date >= startDate && p.eventId.date <= endDate
      );

      worksheet.addRow({
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        totalHours: relevantParticipations.reduce((sum, p) => sum + (p.hoursContributed || 0), 0),
        eventsCount: relevantParticipations.length
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=nss-annual-summary-${year}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate student certificate
router.get('/certificate/:participationId', protect, async (req, res) => {
  try {
    const participation = await Participation.findById(req.params.participationId)
      .populate('studentId', 'name rollNumber department')
      .populate('eventId', 'title date venue category');

    if (!participation || participation.status !== 'approved') {
      return res.status(404).json({ message: 'Approved participation not found' });
    }

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=NSS-Certificate-${participation.studentId.rollNumber}.pdf`);
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const centerX = pageWidth / 2;

    // Background gradient effect
    doc.rect(0, 0, pageWidth, pageHeight).fill('#FFF8F0');

    // Outer border - Orange
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
       .lineWidth(3)
       .stroke('#FF6600');

    // Inner border - Green
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
       .lineWidth(2)
       .stroke('#138808');

    // Decorative corners
    doc.circle(40, 40, 10).fill('#FF6600');
    doc.circle(pageWidth - 40, 40, 10).fill('#138808');
    doc.circle(40, pageHeight - 40, 10).fill('#138808');
    doc.circle(pageWidth - 40, pageHeight - 40, 10).fill('#FF6600');

    // NSS Logo placeholder (text-based) - Centered
    doc.fontSize(40).fillColor('#FF6600').font('Helvetica-Bold');
    doc.text('NSS', 0, 60, { width: pageWidth, align: 'center' });

    // University Name - Centered
    doc.fontSize(20).fillColor('#000000').font('Helvetica-Bold');
    doc.text('VIGNAN UNIVERSITY', 0, 110, { width: pageWidth, align: 'center' });
    
    doc.fontSize(14).fillColor('#666666').font('Helvetica');
    doc.text('Vadlamudi, Guntur - 522213', 0, 135, { width: pageWidth, align: 'center' });

    // Title - Centered
    doc.fontSize(32).fillColor('#FF6600').font('Helvetica-Bold');
    doc.text('CERTIFICATE OF APPRECIATION', 0, 165, { width: pageWidth, align: 'center' });

    // Decorative line - Centered
    const lineMargin = 150;
    doc.moveTo(lineMargin, 205).lineTo(pageWidth - lineMargin, 205)
       .lineWidth(2).stroke('#138808');

    // Body text - Centered
    doc.fontSize(14).fillColor('#000000').font('Helvetica');
    doc.text('This is to certify that', 0, 225, { width: pageWidth, align: 'center' });

    // Student name - Centered
    doc.fontSize(28).fillColor('#FF6600').font('Helvetica-Bold');
    doc.text(participation.studentId.name.toUpperCase(), 0, 255, { width: pageWidth, align: 'center' });

    // Student details - Centered
    doc.fontSize(12).fillColor('#666666').font('Helvetica');
    doc.text(`Roll No: ${participation.studentId.rollNumber} | Department: ${participation.studentId.department || 'N/A'}`, 
             0, 290, { width: pageWidth, align: 'center' });

    // Participation text - Centered
    doc.fontSize(14).fillColor('#000000').font('Helvetica');
    doc.text('has successfully participated in the NSS activity', 0, 320, { width: pageWidth, align: 'center' });

    // Event name - Centered
    doc.fontSize(20).fillColor('#138808').font('Helvetica-Bold');
    doc.text(`"${participation.eventId.title}"`, 0, 350, { width: pageWidth, align: 'center' });

    // Event details box - Centered
    const boxWidth = 400;
    const boxX = (pageWidth - boxWidth) / 2;
    const boxY = 385;
    
    doc.rect(boxX, boxY, boxWidth, 60)
       .fillAndStroke('#F5F5F5', '#CCCCCC');

    doc.fontSize(11).fillColor('#000000').font('Helvetica');
    const col1X = boxX + 20;
    const col2X = boxX + boxWidth / 2 + 10;
    
    doc.text(`Date: ${new Date(participation.eventId.date).toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'long', year: 'numeric' 
    })}`, col1X, boxY + 15);
    doc.text(`Venue: ${participation.eventId.venue}`, col1X, boxY + 35);
    doc.text(`Category: ${participation.eventId.category}`, col2X, boxY + 15);
    doc.text(`Hours: ${participation.hoursContributed} hours`, col2X, boxY + 35);

    // Appreciation text - Centered
    doc.fontSize(12).fillColor('#000000').font('Helvetica-Oblique');
    doc.text('We appreciate your dedication and contribution to society', 
             0, 465, { width: pageWidth, align: 'center' });

    // Signature section - Properly spaced
    const sigY = 500;
    const sig1X = 120;
    const sig2X = pageWidth - 270;
    
    doc.fontSize(10).fillColor('#000000').font('Helvetica');
    
    // Left signature
    doc.text('_____________________', sig1X, sigY, { width: 150, align: 'center' });
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('NSS Coordinator', sig1X, sigY + 20, { width: 150, align: 'center' });
    
    // Right signature
    doc.fontSize(10).font('Helvetica');
    doc.text('_____________________', sig2X, sigY, { width: 150, align: 'center' });
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Principal', sig2X, sigY + 20, { width: 150, align: 'center' });

    // Footer - Centered
    doc.fontSize(8).fillColor('#999999').font('Helvetica');
    doc.text(`Certificate ID: ${participation._id} | Generated on: ${new Date().toLocaleDateString('en-IN')}`, 
             0, pageHeight - 50, { width: pageWidth, align: 'center' });

    // NSS Motto - Centered
    doc.fontSize(10).fillColor('#FF6600').font('Helvetica-BoldOblique');
    doc.text('"NOT ME, BUT YOU"', 0, pageHeight - 30, { width: pageWidth, align: 'center' });

    doc.end();

    // Mark certificate as generated
    participation.certificateGenerated = true;
    await participation.save();
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Dashboard statistics
router.get('/dashboard-stats', protect, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalParticipations = await Participation.countDocuments({ status: 'approved' });

    // Calculate total hours across all students
    const students = await User.find({ role: 'student' });
    const totalHours = students.reduce((sum, student) => sum + (student.totalHours || 0), 0);

    const topVolunteers = await User.find({ role: 'student' })
      .sort({ totalHours: -1 })
      .limit(5)
      .select('name rollNumber totalHours department');

    // Team statistics
    const coordinators = await User.countDocuments({ role: 'student', teamRole: 'coordinator' });
    const coreTeam = await User.countDocuments({ role: 'student', teamRole: 'core-team' });
    const volunteers = await User.countDocuments({ role: 'student', teamRole: 'volunteer' });
    
    // Final certificate statistics
    const eligibleForCertificate = await User.countDocuments({ 
      role: 'student', 
      totalHours: { $gte: 60 }, 
      finalCertificateGenerated: false 
    });

    res.json({
      totalEvents,
      upcomingEvents,
      totalStudents,
      totalParticipations,
      totalHours,
      topVolunteers,
      coordinators,
      coreTeam,
      volunteers,
      eligibleForCertificate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Year Completion Certificate (60+ hours)
router.get('/year-completion-certificate/:studentId', protect, async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.totalHours < 60) {
      return res.status(400).json({ message: 'Student has not completed 60 hours yet' });
    }

    // Get all approved participations
    const participations = await Participation.find({
      studentId: req.params.studentId,
      status: 'approved'
    }).populate('eventId', 'title date');

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=NSS-Year-Completion-${student.rollNumber}.pdf`);
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#FFF8F0');

    // Borders
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(4).stroke('#FF6600');
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60).lineWidth(2).stroke('#138808');

    // Decorative corners
    doc.circle(40, 40, 12).fill('#FF6600');
    doc.circle(pageWidth - 40, 40, 12).fill('#138808');
    doc.circle(40, pageHeight - 40, 12).fill('#138808');
    doc.circle(pageWidth - 40, pageHeight - 40, 12).fill('#FF6600');

    // NSS Logo
    doc.fontSize(45).fillColor('#FF6600').font('Helvetica-Bold');
    doc.text('NSS', 0, 55, { width: pageWidth, align: 'center' });

    // University
    doc.fontSize(22).fillColor('#000000').font('Helvetica-Bold');
    doc.text('VIGNAN UNIVERSITY', 0, 110, { width: pageWidth, align: 'center' });
    doc.fontSize(14).fillColor('#666666').font('Helvetica');
    doc.text('National Service Scheme', 0, 135, { width: pageWidth, align: 'center' });

    // Title
    doc.fontSize(34).fillColor('#FF6600').font('Helvetica-Bold');
    doc.text('YEAR COMPLETION CERTIFICATE', 0, 165, { width: pageWidth, align: 'center' });

    // Decorative line
    doc.moveTo(120, 205).lineTo(pageWidth - 120, 205).lineWidth(2).stroke('#138808');

    // Body
    doc.fontSize(14).fillColor('#000000').font('Helvetica');
    doc.text('This is to certify that', 0, 225, { width: pageWidth, align: 'center' });

    // Student name
    doc.fontSize(30).fillColor('#FF6600').font('Helvetica-Bold');
    doc.text(student.name.toUpperCase(), 0, 255, { width: pageWidth, align: 'center' });

    // Student details
    doc.fontSize(12).fillColor('#666666').font('Helvetica');
    doc.text(`Roll No: ${student.rollNumber} | Department: ${student.department || 'N/A'}`, 
             0, 292, { width: pageWidth, align: 'center' });

    // Achievement text
    doc.fontSize(14).fillColor('#000000').font('Helvetica');
    doc.text('has successfully completed ONE YEAR of dedicated service', 0, 320, { width: pageWidth, align: 'center' });
    doc.text('as an NSS Volunteer and contributed', 0, 340, { width: pageWidth, align: 'center' });

    // Hours highlight
    doc.fontSize(36).fillColor('#138808').font('Helvetica-Bold');
    doc.text(`${student.totalHours} HOURS`, 0, 365, { width: pageWidth, align: 'center' });

    // Additional text
    doc.fontSize(14).fillColor('#000000').font('Helvetica');
    doc.text('to various social service activities', 0, 410, { width: pageWidth, align: 'center' });

    // Achievement box
    const boxWidth = 500;
    const boxX = (pageWidth - boxWidth) / 2;
    const boxY = 440;
    
    doc.rect(boxX, boxY, boxWidth, 40).fillAndStroke('#F0F8FF', '#138808');
    doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
    doc.text(`Total Events Participated: ${participations.length}`, 0, boxY + 12, { width: pageWidth, align: 'center' });

    // Appreciation
    doc.fontSize(13).fillColor('#000000').font('Helvetica-BoldOblique');
    doc.text('In recognition of outstanding commitment to community service', 
             0, 495, { width: pageWidth, align: 'center' });

    // Signatures
    const sigY = 525;
    doc.fontSize(10).fillColor('#000000').font('Helvetica');
    doc.text('_____________________', 100, sigY, { width: 150, align: 'center' });
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('NSS Coordinator', 100, sigY + 20, { width: 150, align: 'center' });
    
    doc.fontSize(10).font('Helvetica');
    doc.text('_____________________', pageWidth / 2 - 75, sigY, { width: 150, align: 'center' });
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('NSS Program Officer', pageWidth / 2 - 75, sigY + 20, { width: 150, align: 'center' });
    
    doc.fontSize(10).font('Helvetica');
    doc.text('_____________________', pageWidth - 250, sigY, { width: 150, align: 'center' });
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Principal', pageWidth - 250, sigY + 20, { width: 150, align: 'center' });

    // Footer
    doc.fontSize(8).fillColor('#999999').font('Helvetica');
    doc.text(`Certificate ID: YC-${student._id} | Issued on: ${new Date().toLocaleDateString('en-IN')}`, 
             0, pageHeight - 45, { width: pageWidth, align: 'center' });

    // Motto
    doc.fontSize(11).fillColor('#FF6600').font('Helvetica-BoldOblique');
    doc.text('"NOT ME, BUT YOU"', 0, pageHeight - 25, { width: pageWidth, align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Year completion certificate error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get students eligible for final certificate
router.get('/eligible-students', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    // Students with 60+ hours who haven't received final certificate yet
    const eligibleStudents = await User.find({
      role: 'student',
      totalHours: { $gte: 60 },
      finalCertificateGenerated: false,
      isActive: true
    }).select('-password').sort({ totalHours: -1 });

    res.json(eligibleStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark student as eligible for final certificate
router.put('/mark-eligible/:studentId', protect, authorize('admin'), async (req, res) => {
  try {
    const { performanceRating, adminRemarks } = req.body;
    
    const student = await User.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.totalHours < 60) {
      return res.status(400).json({ message: 'Student has not completed minimum 60 hours' });
    }

    student.isEligibleForFinalCertificate = true;
    student.performanceRating = performanceRating;
    student.adminRemarks = adminRemarks;
    await student.save();

    res.json({ message: 'Student marked as eligible for final certificate', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Final NSS Completion Certificate (Admin Only)
router.get('/final-certificate/:studentId', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.isEligibleForFinalCertificate) {
      return res.status(400).json({ message: 'Student is not eligible for final certificate. Please mark as eligible first.' });
    }

    if (student.totalHours < 60) {
      return res.status(400).json({ message: 'Student has not completed minimum 60 hours' });
    }

    // Get student's participation history
    const participations = await Participation.find({
      studentId: req.params.studentId,
      status: 'approved'
    }).populate('eventId', 'title date category');

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=NSS-Final-Certificate-${student.rollNumber || student.name.replace(/\s+/g, '-')}.pdf`);
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const centerX = pageWidth / 2;

    // Premium certificate background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#FFF8F0');

    // Decorative border - Triple border design
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30).lineWidth(4).stroke('#FF6600');
    doc.rect(25, 25, pageWidth - 50, pageHeight - 50).lineWidth(2).stroke('#138808');
    doc.rect(35, 35, pageWidth - 70, pageHeight - 70).lineWidth(1).stroke('#FF6600');

    // Corner decorations
    const cornerSize = 40;
    doc.circle(50, 50, cornerSize/2).fill('#FF6600');
    doc.circle(pageWidth - 50, 50, cornerSize/2).fill('#138808');
    doc.circle(50, pageHeight - 50, cornerSize/2).fill('#138808');
    doc.circle(pageWidth - 50, pageHeight - 50, cornerSize/2).fill('#FF6600');

    // NSS Logo area
    doc.fontSize(50).fillColor('#FF6600').font('Helvetica-Bold');
    doc.text('NSS', 0, 70, { width: pageWidth, align: 'center' });

    // University header
    doc.fontSize(24).fillColor('#000000').font('Helvetica-Bold');
    doc.text('VIGNAN UNIVERSITY', 0, 130, { width: pageWidth, align: 'center' });
    doc.fontSize(16).fillColor('#666666').font('Helvetica');
    doc.text('Vadlamudi, Guntur - 522213, Andhra Pradesh', 0, 155, { width: pageWidth, align: 'center' });
    doc.text('National Service Scheme Unit', 0, 175, { width: pageWidth, align: 'center' });

    // Certificate title
    doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
    doc.text('CERTIFICATE OF COMPLETION', 0, 210, { width: pageWidth, align: 'center' });

    // Decorative line
    const lineY = 250;
    doc.moveTo(150, lineY).lineTo(pageWidth - 150, lineY).lineWidth(3).stroke('#138808');

    // Main certificate text
    doc.fontSize(16).fillColor('#000000').font('Helvetica');
    doc.text('This is to certify that', 0, 275, { width: pageWidth, align: 'center' });

    // Student name - prominent
    doc.fontSize(32).fillColor('#FF6600').font('Helvetica-Bold');
    doc.text(student.name.toUpperCase(), 0, 305, { width: pageWidth, align: 'center' });

    // Student details
    doc.fontSize(14).fillColor('#666666').font('Helvetica');
    const detailsY = 345;
    doc.text(`Roll No: ${student.rollNumber || 'N/A'} | Department: ${student.department || 'N/A'} | Year: ${student.year || 'N/A'}`, 
             0, detailsY, { width: pageWidth, align: 'center' });

    // Achievement text
    doc.fontSize(16).fillColor('#000000').font('Helvetica');
    doc.text('has successfully completed the National Service Scheme program', 0, 375, { width: pageWidth, align: 'center' });
    doc.text('and has contributed', 0, 395, { width: pageWidth, align: 'center' });

    // Hours highlight with performance
    doc.fontSize(40).fillColor('#138808').font('Helvetica-Bold');
    doc.text(`${student.totalHours} HOURS`, 0, 420, { width: pageWidth, align: 'center' });

    // Performance rating
    if (student.performanceRating) {
      const ratingColors = {
        'excellent': '#138808',
        'good': '#FF6600', 
        'satisfactory': '#0066CC'
      };
      doc.fontSize(18).fillColor(ratingColors[student.performanceRating] || '#000000').font('Helvetica-Bold');
      doc.text(`Performance: ${student.performanceRating.toUpperCase()}`, 0, 470, { width: pageWidth, align: 'center' });
    }

    // Additional achievement text
    doc.fontSize(14).fillColor('#000000').font('Helvetica');
    doc.text('of dedicated community service with commitment and excellence', 0, 500, { width: pageWidth, align: 'center' });

    // Statistics box
    const boxWidth = 600;
    const boxX = (pageWidth - boxWidth) / 2;
    const boxY = 525;
    
    doc.rect(boxX, boxY, boxWidth, 50).fillAndStroke('#F0F8FF', '#138808');
    doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
    
    const col1X = boxX + 50;
    const col2X = boxX + 200;
    const col3X = boxX + 350;
    const col4X = boxX + 500;
    
    doc.text(`Events: ${participations.length}`, col1X, boxY + 15);
    doc.text(`Hours: ${student.totalHours}`, col2X, boxY + 15);
    doc.text(`Rating: ${student.performanceRating || 'Good'}`, col3X, boxY + 15);
    doc.text(`Year: ${new Date().getFullYear()}`, col4X, boxY + 15);

    // Admin remarks if provided
    if (student.adminRemarks) {
      doc.fontSize(11).fillColor('#666666').font('Helvetica-Oblique');
      doc.text(`Remarks: ${student.adminRemarks}`, 0, boxY + 40, { width: pageWidth, align: 'center' });
    }

    // Recognition text
    doc.fontSize(14).fillColor('#000000').font('Helvetica-BoldOblique');
    doc.text('In recognition of outstanding dedication to community service and social responsibility', 
             0, 590, { width: pageWidth, align: 'center' });

    // Signatures section
    const sigY = 620;
    doc.fontSize(11).fillColor('#000000').font('Helvetica');
    
    // Left signature - NSS Coordinator
    doc.text('_________________________', 120, sigY, { width: 180, align: 'center' });
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('NSS Program Coordinator', 120, sigY + 20, { width: 180, align: 'center' });
    doc.fontSize(9).font('Helvetica');
    doc.text('Vignan University', 120, sigY + 35, { width: 180, align: 'center' });
    
    // Center signature - NSS Program Officer
    doc.fontSize(11).font('Helvetica');
    doc.text('_________________________', centerX - 90, sigY, { width: 180, align: 'center' });
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('NSS Program Officer', centerX - 90, sigY + 20, { width: 180, align: 'center' });
    doc.fontSize(9).font('Helvetica');
    doc.text('Vignan University', centerX - 90, sigY + 35, { width: 180, align: 'center' });
    
    // Right signature - Principal
    doc.fontSize(11).font('Helvetica');
    doc.text('_________________________', pageWidth - 300, sigY, { width: 180, align: 'center' });
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Principal', pageWidth - 300, sigY + 20, { width: 180, align: 'center' });
    doc.fontSize(9).font('Helvetica');
    doc.text('Vignan University', pageWidth - 300, sigY + 35, { width: 180, align: 'center' });

    // Footer with certificate details
    doc.fontSize(8).fillColor('#999999').font('Helvetica');
    doc.text(`Certificate No: NSS-FINAL-${student._id} | Generated on: ${new Date().toLocaleDateString('en-IN')} | Generated by: ${req.user.name}`, 
             0, pageHeight - 40, { width: pageWidth, align: 'center' });

    // NSS Motto
    doc.fontSize(12).fillColor('#FF6600').font('Helvetica-BoldOblique');
    doc.text('"NOT ME, BUT YOU"', 0, pageHeight - 20, { width: pageWidth, align: 'center' });

    doc.end();

    // Mark certificate as generated
    student.finalCertificateGenerated = true;
    student.finalCertificateGeneratedAt = new Date();
    student.finalCertificateGeneratedBy = req.user._id;
    await student.save();

  } catch (error) {
    console.error('Final certificate generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
