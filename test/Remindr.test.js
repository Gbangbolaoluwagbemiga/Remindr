const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Remindr", function () {
  let remindr;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Remindr = await ethers.getContractFactory("Remindr");
    remindr = await Remindr.deploy();
    await remindr.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await remindr.getAddress()).to.be.properAddress;
    });

    it("Should have zero reminders initially", async function () {
      expect(await remindr.getTotalReminders()).to.equal(0);
    });
  });

  describe("Create Reminder", function () {
    it("Should create a reminder successfully", async function () {
      const futureTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

      await expect(
        remindr
          .connect(user1)
          .createReminder("Test Reminder", "This is a test", futureTime)
      ).to.emit(remindr, "ReminderCreated");

      const reminder = await remindr.getReminder(1);
      expect(reminder.title).to.equal("Test Reminder");
      expect(reminder.description).to.equal("This is a test");
      expect(reminder.timestamp).to.equal(futureTime);
      expect(reminder.owner).to.equal(user1.address);
      expect(reminder.isCompleted).to.be.false;
    });

    it("Should reject empty title", async function () {
      const futureTime = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        remindr.connect(user1).createReminder("", "Description", futureTime)
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("Should reject past timestamp", async function () {
      const pastTime = Math.floor(Date.now() / 1000) - 86400;

      await expect(
        remindr.connect(user1).createReminder("Title", "Description", pastTime)
      ).to.be.revertedWith("Timestamp must be in the future");
    });

    it("Should increment reminder counter", async function () {
      const futureTime = Math.floor(Date.now() / 1000) + 86400;

      await remindr.connect(user1).createReminder("Reminder 1", "", futureTime);
      await remindr.connect(user2).createReminder("Reminder 2", "", futureTime);

      expect(await remindr.getTotalReminders()).to.equal(2);
    });
  });

  describe("Update Reminder", function () {
    beforeEach(async function () {
      const futureTime = Math.floor(Date.now() / 1000) + 86400;
      await remindr
        .connect(user1)
        .createReminder("Original", "Original desc", futureTime);
    });

    it("Should update reminder title", async function () {
      await remindr.connect(user1).updateReminder(1, "Updated", "", 0);
      const reminder = await remindr.getReminder(1);
      expect(reminder.title).to.equal("Updated");
    });

    it("Should update reminder description", async function () {
      await remindr.connect(user1).updateReminder(1, "", "Updated desc", 0);
      const reminder = await remindr.getReminder(1);
      expect(reminder.description).to.equal("Updated desc");
    });

    it("Should update reminder timestamp", async function () {
      const newTime = Math.floor(Date.now() / 1000) + 172800;
      await remindr.connect(user1).updateReminder(1, "", "", newTime);
      const reminder = await remindr.getReminder(1);
      expect(reminder.timestamp).to.equal(newTime);
    });

    it("Should reject update from non-owner", async function () {
      await expect(
        remindr.connect(user2).updateReminder(1, "Hacked", "", 0)
      ).to.be.revertedWith("Not the owner");
    });
  });

  describe("Complete Reminder", function () {
    beforeEach(async function () {
      const futureTime = Math.floor(Date.now() / 1000) + 86400;
      await remindr
        .connect(user1)
        .createReminder("Complete me", "", futureTime);
    });

    it("Should mark reminder as completed", async function () {
      await expect(remindr.connect(user1).completeReminder(1)).to.emit(
        remindr,
        "ReminderCompleted"
      );

      const reminder = await remindr.getReminder(1);
      expect(reminder.isCompleted).to.be.true;
    });

    it("Should reject completion from non-owner", async function () {
      await expect(
        remindr.connect(user2).completeReminder(1)
      ).to.be.revertedWith("Not the owner");
    });
  });

  describe("Delete Reminder", function () {
    beforeEach(async function () {
      const futureTime = Math.floor(Date.now() / 1000) + 86400;
      await remindr.connect(user1).createReminder("Delete me", "", futureTime);
    });

    it("Should delete reminder", async function () {
      await expect(remindr.connect(user1).deleteReminder(1)).to.emit(
        remindr,
        "ReminderDeleted"
      );

      await expect(remindr.getReminder(1)).to.be.revertedWith(
        "Reminder does not exist"
      );
    });

    it("Should reject deletion from non-owner", async function () {
      await expect(remindr.connect(user2).deleteReminder(1)).to.be.revertedWith(
        "Not the owner"
      );
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      const futureTime1 = Math.floor(Date.now() / 1000) + 86400;
      const futureTime2 = Math.floor(Date.now() / 1000) + 172800;

      await remindr
        .connect(user1)
        .createReminder("Reminder 1", "", futureTime1);
      await remindr
        .connect(user1)
        .createReminder("Reminder 2", "", futureTime2);
      await remindr
        .connect(user2)
        .createReminder("Reminder 3", "", futureTime1);
    });

    it("Should return user's reminder IDs", async function () {
      const ids = await remindr.getUserReminderIds(user1.address);
      expect(ids.length).to.equal(2);
      expect(ids[0]).to.equal(1);
      expect(ids[1]).to.equal(2);
    });

    it("Should return all user reminders", async function () {
      const reminders = await remindr.getUserReminders(user1.address);
      expect(reminders.length).to.equal(2);
      expect(reminders[0].title).to.equal("Reminder 1");
      expect(reminders[1].title).to.equal("Reminder 2");
    });

    it("Should return only pending reminders", async function () {
      const pending = await remindr.getPendingReminders(user1.address);
      expect(pending.length).to.equal(2);

      // Complete one reminder
      await remindr.connect(user1).completeReminder(1);

      const pendingAfter = await remindr.getPendingReminders(user1.address);
      expect(pendingAfter.length).to.equal(1);
      expect(pendingAfter[0].title).to.equal("Reminder 2");
    });
  });
});
