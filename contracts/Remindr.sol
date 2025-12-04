// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Remindr
 * @notice Enhanced on-chain reminder system with recurring reminders, shared reminders, achievements, and more
 * @dev Comprehensive reminder system with social features and gamification
 */
contract Remindr {
    // Enums
    enum RecurrenceType {
        None,
        Daily,
        Weekly,
        Monthly,
        Yearly,
        Custom
    }

    enum ReminderCategory {
        Personal,
        Governance,
        DeFi,
        NFT,
        Token,
        Airdrop,
        Other
    }

    enum Priority {
        Low,
        Medium,
        High
    }

    // Structs
    struct Reminder {
        uint256 id;
        address owner;
        string title;
        string description;
        uint256 timestamp;
        bool isCompleted;
        bool exists;
        uint256 createdAt;
        RecurrenceType recurrenceType;
        uint256 recurrenceInterval; // For custom recurrence (in seconds)
        uint256 nextOccurrence; // Next occurrence timestamp
        bool isPublic;
        ReminderCategory category;
        Priority priority;
        string[] tags;
        address[] participants; // For shared reminders
        uint256 templateId; // Reference to template if created from one
    }

    struct UserStats {
        uint256 totalRemindersCreated;
        uint256 totalRemindersCompleted;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastCompletionDate;
        uint256 reputationScore; // Based on completion rate and activity
    }

    struct Achievement {
        uint256 id;
        string name;
        string description;
        uint256 requirement; // e.g., 100 reminders created
        bool isActive;
    }

    struct Template {
        uint256 id;
        string name;
        string title;
        string description;
        ReminderCategory category;
        bool isActive;
        uint256 usageCount;
    }

    // State variables
    mapping(address => uint256[]) private userReminders;
    mapping(uint256 => Reminder) public reminders;
    mapping(address => UserStats) public userStats;
    mapping(address => mapping(uint256 => bool)) public userAchievements; // user => achievementId => unlocked
    mapping(uint256 => Achievement) public achievements;
    mapping(uint256 => Template) public templates;
    
    uint256 private reminderCounter;
    uint256 private achievementCounter;
    uint256 private templateCounter;

    // Public reminders for discovery
    uint256[] public publicReminderIds;
    mapping(uint256 => uint256) public reminderPopularity; // reminderId => view/interest count

    // Events
    event ReminderCreated(
        uint256 indexed id,
        address indexed owner,
        string title,
        uint256 timestamp,
        RecurrenceType recurrenceType,
        bool isPublic
    );
    
    event ReminderUpdated(
        uint256 indexed id,
        address indexed owner,
        string title,
        uint256 timestamp
    );
    
    event ReminderDeleted(uint256 indexed id, address indexed owner);
    event ReminderCompleted(uint256 indexed id, address indexed owner);
    event ReminderRecurred(uint256 indexed originalId, uint256 indexed newId, address indexed owner);
    event ParticipantAdded(uint256 indexed reminderId, address indexed participant);
    event ParticipantRemoved(uint256 indexed reminderId, address indexed participant);
    event AchievementUnlocked(address indexed user, uint256 indexed achievementId, string name);
    event TemplateCreated(uint256 indexed templateId, string name);
    event ReminderMadePublic(uint256 indexed reminderId, address indexed owner);

    constructor() {
        // Initialize default achievements
        _initializeAchievements();
        // Initialize default templates
        _initializeTemplates();
    }

    /**
     * @notice Create a new reminder with enhanced features
     */
    function createReminder(
        string memory _title,
        string memory _description,
        uint256 _timestamp,
        RecurrenceType _recurrenceType,
        uint256 _recurrenceInterval,
        bool _isPublic,
        ReminderCategory _category,
        Priority _priority,
        string[] memory _tags,
        uint256 _templateId
    ) external {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_timestamp > block.timestamp, "Timestamp must be in the future");
        
        reminderCounter++;
        uint256 newId = reminderCounter;
        
        address[] memory emptyParticipants;
        
        reminders[newId] = Reminder({
            id: newId,
            owner: msg.sender,
            title: _title,
            description: _description,
            timestamp: _timestamp,
            isCompleted: false,
            exists: true,
            createdAt: block.timestamp,
            recurrenceType: _recurrenceType,
            recurrenceInterval: _recurrenceInterval,
            nextOccurrence: _calculateNextOccurrence(_timestamp, _recurrenceType, _recurrenceInterval),
            isPublic: _isPublic,
            category: _category,
            priority: _priority,
            tags: _tags,
            participants: emptyParticipants,
            templateId: _templateId
        });
        
        userReminders[msg.sender].push(newId);
        
        // Update user stats
        userStats[msg.sender].totalRemindersCreated++;
        _updateReputationScore(msg.sender);
        
        // Add to public list if public
        if (_isPublic) {
            publicReminderIds.push(newId);
            emit ReminderMadePublic(newId, msg.sender);
        }
        
        // Update template usage if from template
        if (_templateId > 0 && templates[_templateId].isActive) {
            templates[_templateId].usageCount++;
        }
        
        // Check for achievements
        _checkAchievements(msg.sender);
        
        emit ReminderCreated(newId, msg.sender, _title, _timestamp, _recurrenceType, _isPublic);
    }

    /**
     * @notice Create reminder from template
     */
    function createReminderFromTemplate(
        uint256 _templateId,
        uint256 _timestamp,
        RecurrenceType _recurrenceType,
        uint256 _recurrenceInterval
    ) external {
        require(templates[_templateId].isActive, "Template not found or inactive");
        Template memory template = templates[_templateId];
        require(_timestamp > block.timestamp, "Timestamp must be in the future");
        
        reminderCounter++;
        uint256 newId = reminderCounter;
        
        address[] memory emptyParticipants;
        string[] memory emptyTags;
        
        reminders[newId] = Reminder({
            id: newId,
            owner: msg.sender,
            title: template.title,
            description: template.description,
            timestamp: _timestamp,
            isCompleted: false,
            exists: true,
            createdAt: block.timestamp,
            recurrenceType: _recurrenceType,
            recurrenceInterval: _recurrenceInterval,
            nextOccurrence: _calculateNextOccurrence(_timestamp, _recurrenceType, _recurrenceInterval),
            isPublic: false,
            category: template.category,
            priority: Priority.Medium,
            tags: emptyTags,
            participants: emptyParticipants,
            templateId: _templateId
        });
        
        userReminders[msg.sender].push(newId);
        
        // Update user stats
        userStats[msg.sender].totalRemindersCreated++;
        _updateReputationScore(msg.sender);
        
        // Update template usage
        templates[_templateId].usageCount++;
        
        // Check for achievements
        _checkAchievements(msg.sender);
        
        emit ReminderCreated(newId, msg.sender, template.title, _timestamp, _recurrenceType, false);
    }

    /**
     * @notice Update an existing reminder
     */
    function updateReminder(
        uint256 _id,
        string memory _title,
        string memory _description,
        uint256 _timestamp,
        ReminderCategory _category,
        Priority _priority,
        string[] memory _tags
    ) external {
        require(reminders[_id].exists, "Reminder does not exist");
        require(reminders[_id].owner == msg.sender || _isParticipant(_id, msg.sender), "Not authorized");
        require(!reminders[_id].isCompleted, "Cannot update completed reminder");
        
        if (bytes(_title).length > 0) {
            reminders[_id].title = _title;
        }
        
        if (bytes(_description).length > 0) {
            reminders[_id].description = _description;
        }
        
        if (_timestamp > 0) {
            require(_timestamp > block.timestamp, "Timestamp must be in the future");
            reminders[_id].timestamp = _timestamp;
            reminders[_id].nextOccurrence = _calculateNextOccurrence(
                _timestamp,
                reminders[_id].recurrenceType,
                reminders[_id].recurrenceInterval
            );
        }
        
        reminders[_id].category = _category;
        reminders[_id].priority = _priority;
        reminders[_id].tags = _tags;
        
        emit ReminderUpdated(_id, msg.sender, reminders[_id].title, reminders[_id].timestamp);
    }

    /**
     * @notice Mark a reminder as completed
     */
    function completeReminder(uint256 _id) external {
        require(reminders[_id].exists, "Reminder does not exist");
        require(reminders[_id].owner == msg.sender || _isParticipant(_id, msg.sender), "Not authorized");
        require(!reminders[_id].isCompleted, "Already completed");
        
        reminders[_id].isCompleted = true;
        
        // Update user stats
        if (reminders[_id].owner == msg.sender) {
            userStats[msg.sender].totalRemindersCompleted++;
            _updateStreak(msg.sender);
            _updateReputationScore(msg.sender);
        }
        
        // Check for achievements
        _checkAchievements(msg.sender);
        
        // Handle recurrence
        if (reminders[_id].recurrenceType != RecurrenceType.None) {
            _createRecurringReminder(_id);
        }
        
        emit ReminderCompleted(_id, msg.sender);
    }

    /**
     * @notice Delete a reminder
     */
    function deleteReminder(uint256 _id) external {
        require(reminders[_id].exists, "Reminder does not exist");
        require(reminders[_id].owner == msg.sender, "Not the owner");
        
        reminders[_id].exists = false;
        
        emit ReminderDeleted(_id, msg.sender);
    }

    /**
     * @notice Add participant to shared reminder
     */
    function addParticipant(uint256 _id, address _participant) external {
        require(reminders[_id].exists, "Reminder does not exist");
        require(reminders[_id].owner == msg.sender, "Not the owner");
        require(!_isParticipant(_id, _participant), "Already a participant");
        require(_participant != address(0), "Invalid address");
        
        reminders[_id].participants.push(_participant);
        userReminders[_participant].push(_id);
        
        emit ParticipantAdded(_id, _participant);
    }

    /**
     * @notice Remove participant from shared reminder
     */
    function removeParticipant(uint256 _id, address _participant) external {
        require(reminders[_id].exists, "Reminder does not exist");
        require(reminders[_id].owner == msg.sender, "Not the owner");
        
        address[] storage participants = reminders[_id].participants;
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == _participant) {
                participants[i] = participants[participants.length - 1];
                participants.pop();
                break;
            }
        }
        
        emit ParticipantRemoved(_id, _participant);
    }

    /**
     * @notice Make reminder public
     */
    function makeReminderPublic(uint256 _id) external {
        require(reminders[_id].exists, "Reminder does not exist");
        require(reminders[_id].owner == msg.sender, "Not the owner");
        require(!reminders[_id].isPublic, "Already public");
        
        reminders[_id].isPublic = true;
        publicReminderIds.push(_id);
        
        emit ReminderMadePublic(_id, msg.sender);
    }

    /**
     * @notice Increment reminder popularity (for trending)
     */
    function incrementReminderPopularity(uint256 _id) external {
        require(reminders[_id].exists, "Reminder does not exist");
        require(reminders[_id].isPublic, "Reminder is not public");
        
        reminderPopularity[_id]++;
    }

    // View functions
    function getReminder(uint256 _id) external view returns (Reminder memory) {
        require(reminders[_id].exists, "Reminder does not exist");
        return reminders[_id];
    }

    function getUserReminders(address _user) external view returns (Reminder[] memory) {
        uint256[] memory ids = userReminders[_user];
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < ids.length; i++) {
            if (reminders[ids[i]].exists) {
                activeCount++;
            }
        }
        
        Reminder[] memory activeReminders = new Reminder[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < ids.length; i++) {
            if (reminders[ids[i]].exists) {
                activeReminders[index] = reminders[ids[i]];
                index++;
            }
        }
        
        return activeReminders;
    }

    function getPublicReminders(uint256 _limit, uint256 _offset) external view returns (Reminder[] memory) {
        uint256 end = _offset + _limit;
        if (end > publicReminderIds.length) {
            end = publicReminderIds.length;
        }
        
        uint256 count = end > _offset ? end - _offset : 0;
        Reminder[] memory result = new Reminder[](count);
        
        for (uint256 i = _offset; i < end; i++) {
            uint256 reminderId = publicReminderIds[i];
            if (reminders[reminderId].exists) {
                result[i - _offset] = reminders[reminderId];
            }
        }
        
        return result;
    }

    function getTrendingReminders(uint256 _limit) external view returns (Reminder[] memory) {
        // Simple implementation - in production, use off-chain indexing
        uint256[] memory sortedIds = new uint256[](_limit);
        uint256 count = 0;
        
        for (uint256 i = 0; i < publicReminderIds.length && count < _limit; i++) {
            uint256 id = publicReminderIds[i];
            if (reminders[id].exists && reminderPopularity[id] > 0) {
                sortedIds[count] = id;
                count++;
            }
        }
        
        // Simple bubble sort by popularity (optimize in production)
        for (uint256 i = 0; i < count; i++) {
            for (uint256 j = 0; j < count - i - 1; j++) {
                if (reminderPopularity[sortedIds[j]] < reminderPopularity[sortedIds[j + 1]]) {
                    uint256 temp = sortedIds[j];
                    sortedIds[j] = sortedIds[j + 1];
                    sortedIds[j + 1] = temp;
                }
            }
        }
        
        Reminder[] memory result = new Reminder[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = reminders[sortedIds[i]];
        }
        
        return result;
    }

    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }

    function getAchievements(address _user) external view returns (uint256[] memory) {
        uint256[] memory unlocked = new uint256[](achievementCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= achievementCounter; i++) {
            if (userAchievements[_user][i]) {
                unlocked[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = unlocked[i];
        }
        
        return result;
    }

    function getTemplates() external view returns (Template[] memory) {
        Template[] memory result = new Template[](templateCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= templateCounter; i++) {
            if (templates[i].isActive) {
                result[count] = templates[i];
                count++;
            }
        }
        
        // Resize
        Template[] memory activeTemplates = new Template[](count);
        for (uint256 i = 0; i < count; i++) {
            activeTemplates[i] = result[i];
        }
        
        return activeTemplates;
    }

    function getTotalReminders() external view returns (uint256) {
        return reminderCounter;
    }

    // Internal functions
    function _calculateNextOccurrence(
        uint256 _timestamp,
        RecurrenceType _type,
        uint256 _interval
    ) internal pure returns (uint256) {
        if (_type == RecurrenceType.None) {
            return 0;
        } else if (_type == RecurrenceType.Daily) {
            return _timestamp + 1 days;
        } else if (_type == RecurrenceType.Weekly) {
            return _timestamp + 1 weeks;
        } else if (_type == RecurrenceType.Monthly) {
            return _timestamp + 30 days;
        } else if (_type == RecurrenceType.Yearly) {
            return _timestamp + 365 days;
        } else if (_type == RecurrenceType.Custom) {
            return _timestamp + _interval;
        }
        return 0;
    }

    function _createRecurringReminder(uint256 _originalId) internal {
        Reminder memory original = reminders[_originalId];
        
        reminderCounter++;
        uint256 newId = reminderCounter;
        
        reminders[newId] = Reminder({
            id: newId,
            owner: original.owner,
            title: original.title,
            description: original.description,
            timestamp: original.nextOccurrence,
            isCompleted: false,
            exists: true,
            createdAt: block.timestamp,
            recurrenceType: original.recurrenceType,
            recurrenceInterval: original.recurrenceInterval,
            nextOccurrence: _calculateNextOccurrence(
                original.nextOccurrence,
                original.recurrenceType,
                original.recurrenceInterval
            ),
            isPublic: original.isPublic,
            category: original.category,
            priority: original.priority,
            tags: original.tags,
            participants: original.participants,
            templateId: original.templateId
        });
        
        userReminders[original.owner].push(newId);
        
        // Add participants
        for (uint256 i = 0; i < original.participants.length; i++) {
            userReminders[original.participants[i]].push(newId);
        }
        
        // Reset original reminder's completed status for next cycle
        reminders[_originalId].isCompleted = false;
        reminders[_originalId].timestamp = original.nextOccurrence;
        reminders[_originalId].nextOccurrence = _calculateNextOccurrence(
            original.nextOccurrence,
            original.recurrenceType,
            original.recurrenceInterval
        );
        
        emit ReminderRecurred(_originalId, newId, original.owner);
    }

    function _isParticipant(uint256 _id, address _user) internal view returns (bool) {
        address[] memory participants = reminders[_id].participants;
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == _user) {
                return true;
            }
        }
        return false;
    }

    function _updateStreak(address _user) internal {
        UserStats storage stats = userStats[_user];
        uint256 today = block.timestamp / 1 days;
        
        if (stats.lastCompletionDate == today - 1) {
            // Continuing streak
            stats.currentStreak++;
        } else if (stats.lastCompletionDate == today) {
            // Already completed today
            return;
        } else {
            // New streak
            stats.currentStreak = 1;
        }
        
        if (stats.currentStreak > stats.longestStreak) {
            stats.longestStreak = stats.currentStreak;
        }
        
        stats.lastCompletionDate = today;
    }

    function _updateReputationScore(address _user) internal {
        UserStats storage stats = userStats[_user];
        if (stats.totalRemindersCreated > 0) {
            // Reputation = completion rate * activity * streak bonus
            uint256 completionRate = (stats.totalRemindersCompleted * 100) / stats.totalRemindersCreated;
            uint256 activity = stats.totalRemindersCreated > 100 ? 100 : stats.totalRemindersCreated;
            uint256 streakBonus = stats.currentStreak * 10;
            
            stats.reputationScore = (completionRate * activity) / 100 + streakBonus;
        }
    }

    function _checkAchievements(address _user) internal {
        UserStats memory stats = userStats[_user];
        
        // Check each achievement
        for (uint256 i = 1; i <= achievementCounter; i++) {
            if (!userAchievements[_user][i] && achievements[i].isActive) {
                bool unlocked = false;
                
                if (i == 1 && stats.totalRemindersCreated >= 10) unlocked = true; // First Steps
                else if (i == 2 && stats.totalRemindersCreated >= 100) unlocked = true; // Reminder Master
                else if (i == 3 && stats.totalRemindersCompleted >= 50) unlocked = true; // Completionist
                else if (i == 4 && stats.currentStreak >= 7) unlocked = true; // Week Warrior
                else if (i == 5 && stats.currentStreak >= 30) unlocked = true; // Month Master
                else if (i == 6 && stats.reputationScore >= 1000) unlocked = true; // Reputation Legend
                
                if (unlocked) {
                    userAchievements[_user][i] = true;
                    emit AchievementUnlocked(_user, i, achievements[i].name);
                }
            }
        }
    }

    function _initializeAchievements() internal {
        achievementCounter = 6;
        
        achievements[1] = Achievement({
            id: 1,
            name: "First Steps",
            description: "Create 10 reminders",
            requirement: 10,
            isActive: true
        });
        
        achievements[2] = Achievement({
            id: 2,
            name: "Reminder Master",
            description: "Create 100 reminders",
            requirement: 100,
            isActive: true
        });
        
        achievements[3] = Achievement({
            id: 3,
            name: "Completionist",
            description: "Complete 50 reminders",
            requirement: 50,
            isActive: true
        });
        
        achievements[4] = Achievement({
            id: 4,
            name: "Week Warrior",
            description: "Maintain a 7-day streak",
            requirement: 7,
            isActive: true
        });
        
        achievements[5] = Achievement({
            id: 5,
            name: "Month Master",
            description: "Maintain a 30-day streak",
            requirement: 30,
            isActive: true
        });
        
        achievements[6] = Achievement({
            id: 6,
            name: "Reputation Legend",
            description: "Reach 1000 reputation score",
            requirement: 1000,
            isActive: true
        });
    }

    function _initializeTemplates() internal {
        templateCounter = 5;
        
        templates[1] = Template({
            id: 1,
            name: "Governance Vote",
            title: "Governance Vote Deadline",
            description: "Don't forget to vote on the proposal",
            category: ReminderCategory.Governance,
            isActive: true,
            usageCount: 0
        });
        
        templates[2] = Template({
            id: 2,
            name: "Token Unlock",
            title: "Token Unlock Date",
            description: "Tokens will be unlocked",
            category: ReminderCategory.Token,
            isActive: true,
            usageCount: 0
        });
        
        templates[3] = Template({
            id: 3,
            name: "NFT Drop",
            title: "NFT Collection Drop",
            description: "NFT collection will be available",
            category: ReminderCategory.NFT,
            isActive: true,
            usageCount: 0
        });
        
        templates[4] = Template({
            id: 4,
            name: "Airdrop Claim",
            title: "Airdrop Claim Deadline",
            description: "Remember to claim your airdrop",
            category: ReminderCategory.Airdrop,
            isActive: true,
            usageCount: 0
        });
        
        templates[5] = Template({
            id: 5,
            name: "DeFi Strategy",
            title: "DeFi Strategy Review",
            description: "Review and adjust your DeFi positions",
            category: ReminderCategory.DeFi,
            isActive: true,
            usageCount: 0
        });
    }
}
