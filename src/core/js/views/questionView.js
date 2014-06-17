/*
* QuestionView
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

    var Handlebars = require('handlebars');
    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var QuestionView = ComponentView.extend({
    
        className: function() {
            return "component "
            + "question-component " 
            + this.model.get('_component')
            + "-component " + this.model.get('_id') 
            + " " + this.model.get('_classes')
            + " " + this.setVisibility()
            + " component-" + this.model.get('_layout')
            + " nth-child-" + this.options.nthChild;
        },

        //////
        // Setup question types
        ////

        preRender: function() {
            // Blank method for setting up questions before rendering
            this.setupQuestion();
            // This method helps setup defualt settings on the model
            this._setupDefaultSettings();



            /*this.setupDefaultSettings();
            this.resetQuestion({resetAttempts:true, initialisingScreen:true});
            this.listenTo(this.model, 'change:_isEnabled', this.onEnabledChanged);*/
        },

        // Left blank for question setup
        setupQuestion: function() {},

        _setupDefaultSettings: function() {
            this.setupButtonSettings();
            this.setupWeightSettings();
        },

        setupButtonSettings: function() {
            // Checks if no buttons object is on the model
            // Sets button either from global object or component
            if (!this.model.has("_buttons")) {
                this.model.set("_buttons", Adapt.course.get("_buttons"));
            } else {
                for(var key in this.model.get("_buttons")) {
                    var value=this.model.get("_buttons")[key];
                    if (!value) {
                        this.model.get("_buttons")[key] = Adapt.course.get("_buttons")[key];
                    }
                }
            }
        },

        setupWeightSettings: function() {
            // Checks if questionWeight exists and if not use global
            if (!this.model.has("_questionWeight")) {
                this.model.set("_questionWeight", Adapt.config.get("_questionWeight"));
            }
        },

        //////
        // Helper methods
        ////

        // Used to setup the correct, incorrect and partly correct feedback
        setupFeedback: function() {
            // This should be moved out
            if(this.model.get('_selectable') === 1) {
                // Code to display single feedback


                /*if(this.getOptionSpecificFeedback()) {
                    this.model.set('feedbackMessage', this.getOptionSpecificFeedback());
                }*/
            } else {

            }
        },
        
        // Used to show feedback based upon whether _canShowFeedback is true
        showFeedback: function() {
                
            if (this.model.get('_canShowFeedback')) {
                Adapt.trigger('questionView:showFeedback', this);
            } else {
                Adapt.trigger('questionView:disabledFeedback', this);
            }

        },

        //////
        // Compulsory methods
        ////

        canSubmit: function() {},

        storeUserAnswer: function() {},

        onCannotSubmit: function() {},

        getNumberOfCorrectAnswers: function() {},

        showMarking: function() {

        },

        updateAttempts: function() {
            if (!this.model.get('_attemptsLeft')) {
                this.model.set("_attemptsLeft", this.model.get('_attempts'));
            }
            this.model.set("_attemptsLeft", this.model.get('_attemptsLeft') - 1);
        },

        setQuestionAsSubmitted: function() {
            this.model.set({
                _isEnabled: false,
                _isSubmitted: true,
                _attemptsLeft: this.model.get("_attemptsLeft")
            });
            this.$(".component-widget").addClass("submitted");
        },

        removeInstructionError: function() {
            this.$(".component-instruction-inner").removeClass("validation-error");
        },

        showInstructionError: function() {
            this.$(".component-instruction-inner").addClass("validation-error");
        },

        setScore: function() {
            console.log('Needs to set score');
        },

        markQuestion: function() {
            console.log('Needs to mark question');


            /*var correctCount = this.getNumberOfCorrectAnswers();
            var score = this.model.get("_questionWeight") * correctCount / this.model.get('_items').length;

            this.model.set({
                "_numberOfCorrectAnswers": correctCount,
                "_score": score
            });
            this.isCorrect() ? this.onQuestionCorrect() : this.onQuestionIncorrect();*/
        },

        updateButtons: function() {
            console.log('update buttons');
        },

        checkQuestionCompletion: function() {
            console.log('check if question is complete');
            if (this.isCorrect()) {
                console.log('question is correct');
            } else if (this.isPartlyCorrect()) {
                console.log('question is partly correct');
            } else {
                console.log('question is wrong');
            }
        },

        //////
        // Button interactions
        ////

        onSubmitClicked: function(event) {
            event.preventDefault();
            if(!this.canSubmit()) {
                this.showInstructionError();
                this.onCannotSubmit();
                return;
            }
        
            this.updateAttempts();
            this.setQuestionAsSubmitted();
            this.removeInstructionError();
            this.storeUserAnswer();
            // Should set question as correct, incorrect or partly
            this.markQuestion();
            this.setScore();
            // Should display markings on the component
            this.showMarking();
            this.checkQuestionCompletion();
            this.updateButtons();
            this.setupFeedback();
            this.showFeedback();
            console.log(this.model);
        },

        //////
        // End of button interactions
        ////




        
        // not sure
        isCorrect: function() {
            return !!Math.floor(this.model.get('_numberOfCorrectAnswers') / this.model.get('_items').length);
        },
        
        // not sure
        isPartlyCorrect: function() {
            return !this.isCorrect() && this.model.get('_isAtLeastOneCorrectSelection');
        },
        
        // not sure
        getNumberOfCorrectAnswers: function() {
            var numberOfCorrectAnswers = 0;
            this.forEachAnswer(function(correct) {
                if(correct) numberOfCorrectAnswers++;
            });
            return numberOfCorrectAnswers;
        },
        
        // not sure
        getOptionSpecificFeedback: function() {
            // Check if option specific feedback has been set
            var selectedItem = this.getSelectedItems();
            if (selectedItem.hasOwnProperty('_feedback')) {
                return selectedItem._feedback;
            } else {
                if (this.isCorrect()) {
                    return this.model.get('_feedback').correct;
                } else if (this.isPartlyCorrect()) {
                    return this.model.get('_feedback')._partlyCorrect.final;
                } else {
                    return this.model.get('_feedback')._incorrect.final;
                }
            }
        },
        
        // not sure
        getSelectedItems: function() {
            var selectedItems = this.model.get('_selectedItems');
            // if no second item exists, return just the first, else return the array
            return !selectedItems[1] ? selectedItems[0] : selectedItems;
        },
        
        resetQuestion: function(properties) {
            if(!!properties.initialisingScreen && this.model.get('_isComplete')) {
                Adapt.trigger('questionView:reset', this);
            }
            this.model.set({"_isEnabled": this.model.get('_isComplete') ? this.model.get("_isEnabledOnRevisit") : true});
            
            if(this.model.get('_isEnabled')) {
                _.each(this.model.get('_selectedItems'), function(item) {item.selected = false}, this);
                this.model.set({
                    _isSubmitted: false,
                    _selectedItems: [],
                    _userAnswer: []
                });
                if(properties.resetAttempts === true) this.model.set("_attemptsLeft", this.model.get('_attempts'));
                if(properties.resetCorrect === true) {
                    this.model.set({
                        _isCorrect: false,
                        _isAtLeastOneCorrectSelection: false
                    });
                }
            }
        },
        
        showMarking: function() {
            _.each(this.model.get('_items'), function(item, i) {
                var $item = this.$('.component-item').eq(i);
                $item.addClass(item.correct ? 'correct' : 'incorrect');
            }, this);
        },
        
        showModelAnswer: function () {
            this.$(".component-widget").removeClass("user").addClass("model");
            this.onModelAnswerShown();
        },
        
        showUserAnswer: function() {
            this.$(".component-widget").removeClass("model").addClass("user");
            this.onUserAnswerShown();
        },
        
        onComplete: function(parameters) {
            this.model.set({
                _isComplete: true,
                _isEnabled: false,
                _isCorrect: !!parameters.correct
            });
            this.$(".component-widget").addClass("disabled");
            if(parameters.correct) this.$(".component-widget").addClass("correct");
            this.showMarking();
            this.showUserAnswer();
            Adapt.trigger('questionView:complete', this);
        },
    
        onModelAnswerClicked: function(event) {
            if(event) event.preventDefault();
            this.showModelAnswer();
            $('.button.user').focus();
        },
        
        onQuestionCorrect: function() {
            this.onComplete({correct: true});
            this.model.set({"feedbackTitle": this.model.get('title'), "feedbackMessage": this.model.get("_feedback").correct});
        },
        
        onQuestionIncorrect: function() {
            if (this.isPartlyCorrect()) {
                if (this.model.get('_attemptsLeft') === 0 || !this.model.get('_feedback')._partlyCorrect.notFinal) {
                    this.model.set({
                        "feedbackTitle": this.model.get('title'),
                        "feedbackMessage": this.model.get('_feedback')._partlyCorrect.final
                    });
                } else {
                    this.model.set({
                        "feedbackTitle": this.model.get('title'),
                        "feedbackMessage": this.model.get('_feedback')._partlyCorrect.notFinal
                    });
                }
            } else {
                if (this.model.get('_attemptsLeft') === 0 || !this.model.get('_feedback')._incorrect.notFinal) {
                    this.model.set({
                        "feedbackTitle": this.model.get('title'),
                        "feedbackMessage": this.model.get('_feedback')._incorrect.final
                    });
                } else {
                    this.model.set({
                        "feedbackTitle": this.model.get('title'),
                        "feedbackMessage": this.model.get('_feedback')._incorrect.notFinal
                    });
                }
            }

            if (Math.ceil(this.model.get("_attemptsLeft")/this.model.get("_attempts")) === 0) {
                this.onComplete({correct: false});
            }
        },
        
        onResetClicked: function(event) {
            if(event) event.preventDefault(); 
            this.resetQuestion({resetAttempts:false, resetCorrect:true});
            this.$(".component-widget").removeClass("submitted");
            this.resetItems();
            $('.button.submit').focus();
        },
    
        onUserAnswerClicked: function(event) {
            if(event) event.preventDefault();
            this.showUserAnswer();
            $('.button.model').focus();
        },

        onEnabledChanged: function () {},

        postRender: function() {
            ComponentView.prototype.postRender.apply(this);
            if(this.model.get('_isEnabled') == false) {
                this.showUserAnswer();
            }
        },
        
        /**
        * to be implemented by subclass
        */
        // compulsory methods
        canSubmit: function() {},
        forEachAnswer: function() {},
        // optional methods
        resetItems: function(){},
        onModelAnswerShown: function() {},
        onUserAnswerShown: function() {},
        storeUserAnswer: function() {},
        onCannotSubmit: function() {}
    }, {
        _isQuestionType: true
    });
    
    return QuestionView;

});