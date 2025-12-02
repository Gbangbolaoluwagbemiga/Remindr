// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Remindr
 * @notice On-chain reminder system for wallet users
 * @dev Allows users to create, update, and delete reminders tied to their wallet address
 */
contract Remindr {
    // Struct to store reminder data
    struct Reminder {
        uint256 id;
        address owner;
        string title;
        string description;
        uint256 timestamp; // Unix timestamp when reminder should trigger
        bool isCompleted;
        bool exists;
        uint256 createdAt;
    }

    // Mapping from user address to their reminder IDs
    mapping(address => uint256[]) private userReminders;
    
    // Mapping from reminder ID to Reminder struct
    mapping(uint256 => Reminder) public reminders;
    
    // Total number of reminders created (used for unique ID generation)
    uint256 private reminderCounter;
    
    // Events
    event ReminderCreated(
        uint256 indexed id,
        address indexed owner,
        string title,
        uint256 timestamp
    );
    
    event ReminderUpdated(
        uint256 indexed id,
        address indexed owner,
        string title,
        uint256 timestamp
    );
    
    event ReminderDeleted(uint256 indexed id, address indexed owner);
    
    event ReminderCompleted(uint256 indexed id, address indexed owner);

    /**
     * @notice Create a new reminder
     * @param _title Title of the reminder
     * @param _description Description/notes for the reminder
     * @param _timestamp Unix timestamp when reminder should trigger
     */
    function createReminder(
        string memory _title,
        string memory _description,
        uint256 _timestamp
    ) external {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_timestamp > block.timestamp, "Timestamp must be in the future");
        
        reminderCounter++;
        uint256 newId = reminderCounter;
        
        reminders[newId] = Reminder({
            id: newId,
            owner: msg.sender,
            title: _title,
            description: _description,
            timestamp: _timestamp,
            isCompleted: false,
            exists: true,
            createdAt: block.timestamp
        });
        
        userReminders[msg.sender].push(newId);
        
        emit ReminderCreated(newId, msg.sender, _title, _timestamp);
    }

    /**
     * @notice Update an existing reminder
     * @param _id ID of the reminder to update
     * @param _title New title (empty string to keep existing)
     * @param _description New description (empty string to keep existing)
     * @param _timestamp New timestamp (0 to keep existing)
     */
    function updateReminder(
        uint256 _id,
        string memory _title,
        string memory _description,
        uint256 _timestamp
    ) external {
        require(reminders[_id].exists, "Reminder does not exist");
        require(reminders[_id].owner == msg.sender, "Not the owner");
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
        }
        
        emit ReminderUpdated(_id, msg.sender, reminders[_id].title, reminders[_id].timestamp);
    }

    /**
     * @notice Mark a reminder as completed
     * @param _id ID of the reminder to complete
     */
    function completeReminder(uint256 _id) external {
        require(reminders[_id].exists, "Reminder does not exist");
        require(reminders[_id].owner == msg.sender, "Not the owner");
        require(!reminders[_id].isCompleted, "Already completed");
        
        reminders[_id].isCompleted = true;
        
        emit ReminderCompleted(_id, msg.sender);
    }

    /**
     * @notice Delete a reminder (sets exists to false, doesn't remove from array)
     * @param _id ID of the reminder to delete
     */
    function deleteReminder(uint256 _id) external {
        require(reminders[_id].exists, "Reminder does not exist");
        require(reminders[_id].owner == msg.sender, "Not the owner");
        
        reminders[_id].exists = false;
        
        emit ReminderDeleted(_id, msg.sender);
    }

    /**
     * @notice Get all reminder IDs for a user
     * @param _user Address of the user
     * @return Array of reminder IDs
     */
    function getUserReminderIds(address _user) external view returns (uint256[] memory) {
        return userReminders[_user];
    }

    /**
     * @notice Get a specific reminder by ID
     * @param _id ID of the reminder
     * @return Reminder struct
     */
    function getReminder(uint256 _id) external view returns (Reminder memory) {
        require(reminders[_id].exists, "Reminder does not exist");
        return reminders[_id];
    }

    /**
     * @notice Get all active (non-deleted) reminders for a user
     * @param _user Address of the user
     * @return Array of Reminder structs
     */
    function getUserReminders(address _user) external view returns (Reminder[] memory) {
        uint256[] memory ids = userReminders[_user];
        uint256 activeCount = 0;
        
        // Count active reminders
        for (uint256 i = 0; i < ids.length; i++) {
            if (reminders[ids[i]].exists) {
                activeCount++;
            }
        }
        
        // Build array of active reminders
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

    /**
     * @notice Get pending reminders (not completed, timestamp not yet reached)
     * @param _user Address of the user
     * @return Array of pending Reminder structs
     */
    function getPendingReminders(address _user) external view returns (Reminder[] memory) {
        uint256[] memory ids = userReminders[_user];
        uint256 pendingCount = 0;
        
        // Count pending reminders
        for (uint256 i = 0; i < ids.length; i++) {
            Reminder memory reminder = reminders[ids[i]];
            if (
                reminder.exists &&
                !reminder.isCompleted &&
                reminder.timestamp > block.timestamp
            ) {
                pendingCount++;
            }
        }
        
        // Build array of pending reminders
        Reminder[] memory pendingReminders = new Reminder[](pendingCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < ids.length; i++) {
            Reminder memory reminder = reminders[ids[i]];
            if (
                reminder.exists &&
                !reminder.isCompleted &&
                reminder.timestamp > block.timestamp
            ) {
                pendingReminders[index] = reminder;
                index++;
            }
        }
        
        return pendingReminders;
    }

    /**
     * @notice Get total number of reminders created
     * @return Total count
     */
    function getTotalReminders() external view returns (uint256) {
        return reminderCounter;
    }
}

