const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizType: {
    type: String,
    required: true
  },
  answers: [{
    questionId: Number,
    answer: Number
  }],  scores: {
    intelligences: {
      type: Map,
      of: Number
    },
    holland: {
      type: Map,
      of: Number
    }
  },
  dominantIntelligence: String,
  hollandType: String,
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
