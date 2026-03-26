import { db, doc, getDoc, setDoc, updateDoc, increment, Timestamp } from '../firebase';

export const StatsService = {
  async incrementStats(meals: number) {
    const globalRef = doc(db, 'stats', 'global');
    const today = new Date().toISOString().split('T')[0];
    const dailyRef = doc(db, 'dailyStats', today);

    const co2 = meals * 0.3;

    try {
      // Update Global Stats
      const globalSnap = await getDoc(globalRef);
      if (!globalSnap.exists()) {
        await setDoc(globalRef, {
          mealsSaved: meals,
          peopleFed: meals,
          co2Reduced: co2,
          activeVolunteers: 0,
          lastUpdated: Timestamp.now()
        });
      } else {
        await updateDoc(globalRef, {
          mealsSaved: increment(meals),
          peopleFed: increment(meals),
          co2Reduced: increment(co2),
          lastUpdated: Timestamp.now()
        });
      }

      // Update Daily Stats
      const dailySnap = await getDoc(dailyRef);
      if (!dailySnap.exists()) {
        await setDoc(dailyRef, {
          date: today,
          mealsSaved: meals,
          peopleFed: meals,
          co2Reduced: co2
        });
      } else {
        await updateDoc(dailyRef, {
          mealsSaved: increment(meals),
          peopleFed: increment(meals),
          co2Reduced: increment(co2)
        });
      }
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  },

  async incrementVolunteers() {
    const globalRef = doc(db, 'stats', 'global');
    try {
      const globalSnap = await getDoc(globalRef);
      if (!globalSnap.exists()) {
        await setDoc(globalRef, {
          mealsSaved: 0,
          peopleFed: 0,
          co2Reduced: 0,
          activeVolunteers: 1,
          lastUpdated: Timestamp.now()
        });
      } else {
        await updateDoc(globalRef, {
          activeVolunteers: increment(1),
          lastUpdated: Timestamp.now()
        });
      }
    } catch (error) {
      console.error("Error updating volunteer stats:", error);
    }
  }
};
