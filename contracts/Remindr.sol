// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Remindr
 * @notice Advanced on-chain reminder system with recurring reminders, shared reminders, achievements, and more
 * @dev Comprehensive reminder system with social features and gamification
 */
contract Remindr {
    // Enums
    enum RecurrenceType {
        None,      // 0 - One-time reminder
        Daily,     // 1 - Every day
        Weekly,    // 2 - Every week
        Monthly,   // 3 - Every month
        Yearly,    // 4 - Every year
        Custom     // 5 - Custom interval in seconds
    }

    enum ReminderPriority {
        Low,       // 0
        Medium,    // 1
        High       // 2
    }

    enum Category {
        Personal,      // 0
        Governance,    // 1
        DeFi,          // 2
        NFT,           // 3
        Airdrop,       // 4
        TokenUnlock,   // 5
        Other          // 6
    }

    // Structs
    struct Reminder {
        uint256 id;
        address owner;
        string title;
        string description;
        uint256 timestamp; // Unix timestamp when reminder should trigger
        bool isCompleted;
        bool exists;
        uint256 createdAt;
        RecurrenceType recurrenceType;
        uint256 recurrenceInterval; // For custom recurrence (in seconds)
        uint256 nextOccurrence; // Next occurrence timestamp
        bool isPublic; // Public reminders visible to everyone
        bool isShared; // Shared reminder with multiple participants
        address[] participants; // For shared reminders
        Category category;
        ReminderPriority priority;
        string[] tags;
        uint256 templateId; // 0 if not from template
        uint256 snoozeCount;
    }

    struct UserStats {
        uint256 totalRemindersCreated;
        uint256 totalRemindersCompleted;
        uint256 totalRemindersShared;
        uint256 streakDays; // Current streak
        uint256 longestStreak; // Longest streak
        uint256 lastActivityTimestamp;
        uint256 reputationScore; // 0-1000 reputation score
    }

    struct Achievement {
        uint256 id;
        string name;
        string description;
        uint256 requirement; // Requirement to unlock (e.g., 10 reminders)
        bool isUnlocked;
        uint256 unlockedAt;
    }

    struct Template {
        uint256 id;
        string title;
        string description;
        Category category;
        uint256 defaultDuration; // Default duration in seconds from now
        bool exists;
    }

    // Mappings
    mapping(address => uint256[]) private userReminders;
    mapping(uint256 => Reminder) public reminders;
    mapping(address => UserStats) public userStats;
    mapping(address => Achievement[]) public userAchievements;
    mapping(uint256 => Template) public templates;
    mapping(address => mapping(uint256 => bool)) public achievementUnlocked; // user => achievementId => unlocked
    
    // Arrays for public access
    uint256[] public publicReminderIds; // Public reminders
    uint256[] public templateIds; // Available templates
    
    // Counters
    uint256 private reminderCounter;
    uint256 private templateCounter;
    uint256 private achievementCounter;
    
    // Constants
    uint256 public constant MAX_PARTICIPANTS = 50;
    uint256 public constant MAX_TAGS = 10;
    uint256 public constant REPUTATION_BASE = 10;
    uint256 public constant SNOOZE_LIMIT = 5;
    uint256 public constant SNOOZE_MAX_SECONDS = 30 days;

    address public admin;
    bool public paused;
    
    // Events
    event ReminderCreated(
        uint256 indexed id,
        address indexed owner,
        string title,
        uint256 timestamp,
        RecurrenceType recurrenceType,
        bool isPublic,
        Category category
    );
    
    event ReminderUpdated(
        uint256 indexed id,
        address indexed owner,
        string title,
        uint256 timestamp
    );
    
    event ReminderDeleted(uint256 indexed id, address indexed owner);
    
    event ReminderCompleted(uint256 indexed id, address indexed owner);
    
    event ReminderRecurred(
        uint256 indexed originalId,
        uint256 indexed newId,
        uint256 nextOccurrence
    );
    
    event ParticipantAdded(uint256 indexed reminderId, address indexed participant);
    
    event ParticipantRemoved(uint256 indexed reminderId, address indexed participant);
    
    event AchievementUnlocked(
        address indexed user,
        uint256 indexed achievementId,
        string name
    );
    
    event TemplateCreated(uint256 indexed templateId, string title, Category category);
    
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event ReminderSnoozed(uint256 indexed id, address indexed user, uint256 newTimestamp, uint256 snoozeBy);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }
    modifier onlyReminderOwner(uint256 _id) {
        require(reminders[_id].exists);
        require(reminders[_id].owner == msg.sender);
        _;
    }

    modifier onlyParticipant(uint256 _id) {
        require(reminders[_id].exists, "Reminder does not exist");
        require(
            reminders[_id].owner == msg.sender || 
            isParticipant(_id, msg.sender)
        );
        _;
    }

    /**
     * @notice Initialize default templates
     */
    constructor() {
        admin = msg.sender;
        paused = false;
        _createTemplate("Governance Vote", "Reminder for DAO governance vote", Category.Governance, 7 days);
        _createTemplate("Token Unlock", "Reminder for token unlock event", Category.TokenUnlock, 30 days);
        _createTemplate("Airdrop Claim", "Reminder to claim airdrop", Category.Airdrop, 14 days);
        _createTemplate("NFT Drop", "Reminder for NFT mint/drop", Category.NFT, 3 days);
        _createTemplate("DeFi Strategy", "Reminder for DeFi action", Category.DeFi, 1 days);
    }

    function pause() external onlyAdmin {
        paused = true;
    }

    function unpause() external onlyAdmin {
        paused = false;
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0));
        admin = _newAdmin;
    }

    /**
     * @notice Create a new reminder with advanced features
     */
    function createReminder(
        string memory _title,
        string memory _description,
        uint256 _timestamp,
        RecurrenceType _recurrenceType,
        uint256 _recurrenceInterval,
        bool _isPublic,
        Category _category,
        ReminderPriority _priority,
        string[] memory _tags,
        uint256 _templateId
    ) external {
        require(!paused);
        _createReminderInternal(
            _title,
            _description,
            _timestamp,
            _recurrenceType,
            _recurrenceInterval,
            _isPublic,
            _category,
            _priority,
            _tags,
            _templateId
        );
    }

    /**
     * @notice Internal function to create a reminder
     */
    function _createReminderInternal(
        string memory _title,
        string memory _description,
        uint256 _timestamp,
        RecurrenceType _recurrenceType,
        uint256 _recurrenceInterval,
        bool _isPublic,
        Category _category,
        ReminderPriority _priority,
        string[] memory _tags,
        uint256 _templateId
    ) internal {
        require(bytes(_title).length > 0);
        require(_timestamp > block.timestamp);
        require(_tags.length <= MAX_TAGS);
        
        reminderCounter++;
        uint256 newId = reminderCounter;
        
        uint256 nextOccurrence = _calculateNextOccurrence(
            _timestamp,
            _recurrenceType,
            _recurrenceInterval
        );
        
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
            nextOccurrence: nextOccurrence,
            isPublic: _isPublic,
            isShared: false,
            participants: new address[](0),
            category: _category,
            priority: _priority,
            tags: _tags,
            templateId: _templateId,
            snoozeCount: 0
        });
        
        userReminders[msg.sender].push(newId);
        
        if (_isPublic) {
            publicReminderIds.push(newId);
        }
        
        // Update user stats
        userStats[msg.sender].totalRemindersCreated++;
        _updateReputation(msg.sender);
        _checkAchievements(msg.sender);
        _updateStreak(msg.sender);
        
        emit ReminderCreated(newId, msg.sender, _title, _timestamp, _recurrenceType, _isPublic, _category);
    }

    /**
     * @notice Create reminder from template
     */
    function createReminderFromTemplate(
        uint256 _templateId,
        uint256 _timestamp,
        RecurrenceType _recurrenceType,
        bool _isPublic
    ) external {
        require(!paused);
        require(templates[_templateId].exists);
        Template memory template = templates[_templateId];
        
        _createReminderInternal(
            template.title,
            template.description,
            _timestamp,
            _recurrenceType,
            0,
            _isPublic,
            template.category,
            ReminderPriority.Medium,
            new string[](0),
            _templateId
        );
    }

    /**
     * @notice Add participants to a reminder (make it shared)
     */
    function addParticipant(uint256 _id, address _participant) external onlyReminderOwner(_id) {
        require(!paused);
        require(!isParticipant(_id, _participant));
        require(_participant != reminders[_id].owner);
        require(reminders[_id].participants.length < MAX_PARTICIPANTS);
        
        reminders[_id].participants.push(_participant);
        reminders[_id].isShared = true;
        userReminders[_participant].push(_id);
        
        userStats[msg.sender].totalRemindersShared++;
        
        emit ParticipantAdded(_id, _participant);
    }

    /**
     * @notice Remove a participant from a reminder
     */
    function removeParticipant(uint256 _id, address _participant) external onlyReminderOwner(_id) {
        require(!paused);
        require(isParticipant(_id, _participant));
        
        address[] storage participants = reminders[_id].participants;
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == _participant) {
                participants[i] = participants[participants.length - 1];
                participants.pop();
                break;
            }
        }
        
        if (participants.length == 0) {
            reminders[_id].isShared = false;
        }
        
        emit ParticipantRemoved(_id, _participant);
    }

    /**
     * @notice Complete a reminder (can be called by owner or participant)
     */
    function completeReminder(uint256 _id) external onlyParticipant(_id) {
        require(!paused);
        require(!reminders[_id].isCompleted, "Already completed");
        
        reminders[_id].isCompleted = true;
        
        // Update stats
        userStats[msg.sender].totalRemindersCompleted++;
        _updateReputation(msg.sender);
        _checkAchievements(msg.sender);
        _updateStreak(msg.sender);
        
        // Handle recurrence
        if (reminders[_id].recurrenceType != RecurrenceType.None && 
            reminders[_id].nextOccurrence > block.timestamp) {
            _createRecurringInstance(_id);
        }
        
        emit ReminderCompleted(_id, msg.sender);
    }
    function snoozeReminder(uint256 _id, uint256 _snoozeBy) external onlyParticipant(_id) {
        require(!paused);
        require(!reminders[_id].isCompleted);
        require(_snoozeBy > 0 && _snoozeBy <= SNOOZE_MAX_SECONDS);
        Reminder storage r = reminders[_id];
        require(r.snoozeCount < SNOOZE_LIMIT);
        r.timestamp = r.timestamp + _snoozeBy;
        r.nextOccurrence = _calculateNextOccurrence(
            r.timestamp,
            r.recurrenceType,
            r.recurrenceInterval
        );
        r.snoozeCount++;
        emit ReminderSnoozed(_id, msg.sender, r.timestamp, _snoozeBy);
    }

    /**
     * @notice Update an existing reminder
     */
    function updateReminder(
        uint256 _id,
        string memory _title,
        string memory _description,
        uint256 _timestamp,
        Category _category,
        ReminderPriority _priority,
        string[] memory _tags
    ) external onlyReminderOwner(_id) {
        require(!paused);
        require(!reminders[_id].isCompleted, "Cannot update completed reminder");
        require(_tags.length <= MAX_TAGS);
        
        if (bytes(_title).length > 0) {
            reminders[_id].title = _title;
        }
        
        if (bytes(_description).length > 0) {
            reminders[_id].description = _description;
        }
        
        if (_timestamp > 0) {
            require(_timestamp > block.timestamp);
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
     * @notice Delete a reminder
     */
    function deleteReminder(uint256 _id) external onlyReminderOwner(_id) {
        require(!paused);
        reminders[_id].exists = false;
        emit ReminderDeleted(_id, msg.sender);
    }

    /**
     * @notice Process recurring reminders (can be called by anyone)
     */
    function processRecurringReminders(uint256[] memory _reminderIds) external {
        require(!paused);
        for (uint256 i = 0; i < _reminderIds.length; i++) {
            uint256 id = _reminderIds[i];
            Reminder memory reminder = reminders[id];
            
            if (reminder.exists && 
                !reminder.isCompleted && 
                reminder.recurrenceType != RecurrenceType.None &&
                reminder.nextOccurrence <= block.timestamp &&
                reminder.timestamp <= block.timestamp) {
                _createRecurringInstance(id);
            }
        }
    }
    function batchCompleteReminders(uint256[] memory _ids) external {
        require(!paused);
        for (uint256 i = 0; i < _ids.length; i++) {
            this.completeReminder(_ids[i]);
        }
    }

    /**
     * @notice Create a new template
     */
    function createTemplate(
        string memory _title,
        string memory _description,
        Category _category,
        uint256 _defaultDuration
    ) external onlyAdmin {
        templateCounter++;
        uint256 newId = templateCounter;
        
        templates[newId] = Template({
            id: newId,
            title: _title,
            description: _description,
            category: _category,
            defaultDuration: _defaultDuration,
            exists: true
        });
        
        templateIds.push(newId);
        
        emit TemplateCreated(newId, _title, _category);
    }

    // View Functions
    function getReminder(uint256 _id) external view returns (Reminder memory) {
        require(reminders[_id].exists);
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
        uint256 length = publicReminderIds.length;
        if (_offset >= length) {
            return new Reminder[](0);
        }
        
        uint256 end = _offset + _limit;
        if (end > length) {
            end = length;
        }
        
        uint256 count = end - _offset;
        Reminder[] memory result = new Reminder[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 id = publicReminderIds[_offset + i];
            if (reminders[id].exists) {
                result[i] = reminders[id];
            }
        }
        
        return result;
    }

    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }

    function getTemplates() external view returns (Template[] memory) {
        Template[] memory result = new Template[](templateIds.length);
        for (uint256 i = 0; i < templateIds.length; i++) {
            result[i] = templates[templateIds[i]];
        }
        return result;
    }

    function isParticipant(uint256 _id, address _user) public view returns (bool) {
        address[] memory participants = reminders[_id].participants;
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == _user) {
                return true;
            }
        }
        return false;
    }

    function getTotalReminders() external view returns (uint256) {
        return reminderCounter;
    }

    // Internal Functions
    function _createRecurringInstance(uint256 _originalId) internal {
        Reminder memory original = reminders[_originalId];
        
        reminderCounter++;
        uint256 newId = reminderCounter;
        
        uint256 nextOccurrence = _calculateNextOccurrence(
            original.nextOccurrence,
            original.recurrenceType,
            original.recurrenceInterval
        );
        
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
            nextOccurrence: nextOccurrence,
            isPublic: original.isPublic,
            isShared: original.isShared,
            participants: original.participants,
            category: original.category,
            priority: original.priority,
            tags: original.tags,
            templateId: original.templateId,
            snoozeCount: 0
        });
        
        // Add to owner's reminders
        userReminders[original.owner].push(newId);
        
        // Add to participants' reminders
        for (uint256 i = 0; i < original.participants.length; i++) {
            userReminders[original.participants[i]].push(newId);
        }
        
        // Update original reminder's next occurrence
        reminders[_originalId].nextOccurrence = nextOccurrence;
        
        if (original.isPublic) {
            publicReminderIds.push(newId);
        }
        
        emit ReminderRecurred(_originalId, newId, nextOccurrence);
    }

    function _calculateNextOccurrence(
        uint256 _currentTimestamp,
        RecurrenceType _recurrenceType,
        uint256 _interval
    ) internal pure returns (uint256) {
        if (_recurrenceType == RecurrenceType.None) {
            return 0;
        } else if (_recurrenceType == RecurrenceType.Daily) {
            return _currentTimestamp + 1 days;
        } else if (_recurrenceType == RecurrenceType.Weekly) {
            return _currentTimestamp + 1 weeks;
        } else if (_recurrenceType == RecurrenceType.Monthly) {
            return _currentTimestamp + 30 days; // Approximate
        } else if (_recurrenceType == RecurrenceType.Yearly) {
            return _currentTimestamp + 365 days;
        } else if (_recurrenceType == RecurrenceType.Custom) {
            return _currentTimestamp + _interval;
        }
        return 0;
    }

    function _createTemplate(
        string memory _title,
        string memory _description,
        Category _category,
        uint256 _defaultDuration
    ) internal {
        templateCounter++;
        uint256 newId = templateCounter;
        
        templates[newId] = Template({
            id: newId,
            title: _title,
            description: _description,
            category: _category,
            defaultDuration: _defaultDuration,
            exists: true
        });
        
        templateIds.push(newId);
    }

    function _updateReputation(address _user) internal {
        UserStats storage stats = userStats[_user];
        
        // Reputation based on completion rate
        if (stats.totalRemindersCreated > 0) {
            uint256 completionRate = (stats.totalRemindersCompleted * 100) / stats.totalRemindersCreated;
            stats.reputationScore = completionRate * 10; // Scale to 0-1000
            
            // Bonus for streaks
            stats.reputationScore += stats.streakDays * 5;
            
            // Cap at 1000
            if (stats.reputationScore > 1000) {
                stats.reputationScore = 1000;
            }
        }
        
        emit ReputationUpdated(_user, stats.reputationScore);
    }

    function _updateStreak(address _user) internal {
        UserStats storage stats = userStats[_user];
        uint256 today = block.timestamp / 1 days;
        uint256 lastActivity = stats.lastActivityTimestamp / 1 days;
        
        if (today == lastActivity) {
            // Already updated today
            return;
        } else if (today == lastActivity + 1) {
            // Consecutive day
            stats.streakDays++;
        } else {
            // Streak broken
            if (stats.streakDays > stats.longestStreak) {
                stats.longestStreak = stats.streakDays;
            }
            stats.streakDays = 1;
        }
        
        stats.lastActivityTimestamp = block.timestamp;
    }

    function _checkAchievements(address _user) internal {
        UserStats memory stats = userStats[_user];
        
        // Achievement: First Reminder
        if (stats.totalRemindersCreated == 1 && !achievementUnlocked[_user][1]) {
            _unlockAchievement(_user, 1, "First Reminder", "Created your first reminder!");
        }
        
        // Achievement: 10 Reminders
        if (stats.totalRemindersCreated == 10 && !achievementUnlocked[_user][2]) {
            _unlockAchievement(_user, 2, "Getting Started", "Created 10 reminders!");
        }
        
        // Achievement: 100 Reminders
        if (stats.totalRemindersCreated == 100 && !achievementUnlocked[_user][3]) {
            _unlockAchievement(_user, 3, "Reminder Master", "Created 100 reminders!");
        }
        
        // Achievement: Perfect Week (7 day streak)
        if (stats.streakDays == 7 && !achievementUnlocked[_user][4]) {
            _unlockAchievement(_user, 4, "Perfect Week", "7 day streak!");
        }
        
        // Achievement: 50 Completed
        if (stats.totalRemindersCompleted == 50 && !achievementUnlocked[_user][5]) {
            _unlockAchievement(_user, 5, "Completionist", "Completed 50 reminders!");
        }
        
        // Achievement: Social Butterfly (10 shared reminders)
        if (stats.totalRemindersShared == 10 && !achievementUnlocked[_user][6]) {
            _unlockAchievement(_user, 6, "Social Butterfly", "Shared 10 reminders!");
        }
    }

    function _unlockAchievement(
        address _user,
        uint256 _achievementId,
        string memory _name,
        string memory _description
    ) internal {
        achievementUnlocked[_user][_achievementId] = true;
        
        Achievement memory achievement = Achievement({
            id: _achievementId,
            name: _name,
            description: _description,
            requirement: 0,
            isUnlocked: true,
            unlockedAt: block.timestamp
        });
        
        userAchievements[_user].push(achievement);
        
        emit AchievementUnlocked(_user, _achievementId, _name);
    }
}
