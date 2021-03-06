var formValidator = require('./form_validation');
var bcrypt = require('bcrypt');
var model = require('./model');
var uuid = require('node-uuid');
var email_interface = require('./email_interface');
var config = require('./config');
var slug = require('slug');
var shortid = require('shortid');
var gravatar = require('gravatar');
var uploader = require('./upload');
var vote_utils = require('./vote');
var url = require('./url');
var mongoosePaginate = require('mongoose-paginate');
var notifications = require('./notifications');
var trending = require('./trending');

module.exports = {

    getQuestion: function (req, res) {

        var _id = req.params._id;

        model.ModelContainer.QuestionModel.findOne({_id: _id}, function (err, question) {

            res.json(question);

        });
    },

    getPaginatedTimeline: function (req, res) {

        var page = req.params.page;
        var user_id = req.params.user_id;

        model.ModelContainer.TimelineModel.paginate({user: user_id}, page, 10, function (error, pageCount, paginatedResults, itemCount) {
            if (error) {
                console.error(error);
                res.json(error);
            } else {
                console.log('Pages:', pageCount);
                console.log(paginatedResults);

                res.json(paginatedResults);
            }
        }, {populate: ['question', 'user'], sortBy: {created_at: -1}});

    },

    getPaginatedQuestions: function(req, res) {

        var page = req.params.page;
        var user_id = req.params.user_id;

        model.ModelContainer.QuestionModel.paginate({user: user_id}, page, 10, function (error, pageCount, paginatedResults, itemCount) {
            if (error) {
                console.error(error);
                res.json(error);
            } else {
                console.log('Pages:', pageCount);
                console.log(paginatedResults);

                res.json(paginatedResults);
            }
        }, {populate: ['user'], sortBy: {created_at: -1}});

    },

    getPaginatedTrendingQuestions: function(req, res) {

        var page = req.params.page;

        trending.getPopularTrends(10, page, function(questions) {
            res.json(questions);
        });

    },

    getPaginatedNotifications: function(req, res) {

        var page = req.params.page;
        var user_id = req.params.user_id;

        notifications.getNotificationsByPageAndUser(user_id, page, function(paginatedResults) {

            res.json(paginatedResults);

        });

    },

    deleteQuestion: function(req, res) {

        var question_id = req.params.question_id;

        model.ModelContainer.QuestionModel.findOne({_id: question_id}, function(err, q) {

            q.is_deleted = true;

            q.save(function(err, qSaved) {
                res.json(qSaved);
            });

        });
    },

    markAsReadNotifications: function(req, res) {

        var user_id = req.body.user_id;

        model.ModelContainer.NotificationModel.find({user: user_id, read: false}, function(err, notifs) {

            notifs.forEach(function(n) {
                n.read = true;
                n.save();
            });

            res.json({message: 'success'});
        });
    },

    addVote: function (req, res) {

        var question_id = req.body.question_id;
        var vote_value = req.body.vote_value;
        var fingerprints = req.body.fingerprints;
        var username = req.session.username;

        var vote = {
            vote_value: vote_value,
            fingerprints: fingerprints,
            question: question_id
        };

        if (username) {

            model.ModelContainer.UserModel.findOne({username: username}, function (err, user) {

                vote.user = user._id;

                vote_utils.vote(vote, user, function (response) {

                    res.json(response);

                });
            });
        }
        else {

            vote_utils.vote(vote, null, function (response) {

                res.json(response);

            });

        }
    }

};