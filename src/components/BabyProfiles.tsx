import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Baby, X, Check, Pencil, Trash2 } from 'lucide-react';
import { BabyProfile } from '../types';

interface BabyProfilesProps {
  babies: BabyProfile[];
  selectedBabyId: string;
  onSelectBaby: (babyId: string) => void;
  onAddBaby: (baby: Omit<BabyProfile, 'id' | 'createdAt'>) => void;
  onEditBaby: (babyId: string, baby: Omit<BabyProfile, 'id' | 'createdAt'>) => void; // NEW
  onDeleteBaby: (babyId: string) => void; // NEW
}

export default function BabyProfiles({ 
  babies, 
  selectedBabyId, 
  onSelectBaby, 
  onAddBaby,
  onEditBaby,   // NEW
  onDeleteBaby  // NEW
}: BabyProfilesProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<string | null>(null); // Track which baby is being edited
  
  const [babyName, setBabyName] = useState<string>('');
  const [babyAge, setBabyAge] = useState<number>(3);
  const [babyGender, setBabyGender] = useState<'boy' | 'girl' | 'surprise'>('surprise');

  // Reset form
  const resetForm = () => {
    setBabyName('');
    setBabyAge(3);
    setBabyGender('surprise');
  };

  // Handle add baby
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyName.trim()) return;
    onAddBaby({ name: babyName, ageMonths: Number(babyAge) || 1, gender: babyGender });
    resetForm();
    setShowAddForm(false);
  };

  // Handle edit baby - open form with existing data
  const handleEditOpen = (baby: BabyProfile) => {
    setBabyName(baby.name);
    setBabyAge(baby.ageMonths);
    setBabyGender(baby.gender);
    setShowEditForm(baby.id);
    setShowAddForm(false);
  };

  // Handle edit submit
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyName.trim() || !showEditForm) return;
    onEditBaby(showEditForm, { name: babyName, ageMonths: Number(babyAge) || 1, gender: babyGender });
    resetForm();
    setShowEditForm(null);
  };

  // Handle delete with confirmation
  const handleDelete = (babyId: string, babyName: string) => {
    if (window.confirm(`Are you sure you want to remove "${babyName}"? This will not delete their history.`)) {
      onDeleteBaby(babyId);
    }
  };

  const genderColors = {
    boy: { bg: 'bg-blue-50', border: 'border-blue-200', activeBg: 'bg-blue-50', activeBorder: 'border-blue-400', dot: 'bg-blue-400', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
    girl: { bg: 'bg-rose-50', border: 'border-rose-200', activeBg: 'bg-rose-50', activeBorder: 'border-rose-400', dot: 'bg-rose-400', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
    surprise: { bg: 'bg-[#EBF4EE]', border: 'border-[#A8CCAF]', activeBg: 'bg-[#EBF4EE]', activeBorder: 'border-[#5C8A6B]', dot: 'bg-[#5C8A6B]', text: 'text-[#3A6349]', badge: 'bg-[#D6EAD9] text-[#3A6349]' }
  };

  return (
    <div className="card p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EBF4EE] flex items-center justify-center">
            <Baby className="w-4 h-4 text-[#5C8A6B]" strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-semibold text-[#1A1614]">Little Ones</h3>
          <span className="text-xs text-[#A8A09A] bg-[#F5F2EE] px-2 py-0.5 rounded-full font-medium">{babies.length}</span>
        </div>
        <button
          id="btn-trigger-baby-creation"
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setShowEditForm(null);
            resetForm();
          }}
          className={`text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${showAddForm ? 'bg-[#F5F2EE] text-[#7A716A]' : 'text-[#5C8A6B] hover:bg-[#EBF4EE]'}`}
        >
          {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAddForm ? 'Cancel' : 'Add baby'}
        </button>
      </div>

      {/* ── ADD FORM ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onSubmit={handleSubmitAdd}
            id="baby-creation-form"
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 bg-[#F7F5F2] rounded-xl border border-[#EAE6E0] space-y-3">
              <p className="text-xs font-semibold text-[#7A716A] uppercase tracking-wide">Register Baby</p>
              <div>
                <label className="block text-[11px] font-medium text-[#7A716A] mb-1">Name</label>
                <input id="baby-new-input-name" type="text" required placeholder="e.g. Leo" value={babyName} onChange={e => setBabyName(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-[#E0DBD5] bg-white text-[#1A1614] focus:ring-2 focus:ring-[#5C8A6B]/20 focus:border-[#5C8A6B] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#7A716A] mb-1">Age (months)</label>
                  <input id="baby-new-input-age" type="number" min="0" max="36" required value={babyAge} onChange={e => setBabyAge(parseInt(e.target.value) || 1)} className="w-full text-sm px-3 py-2 rounded-lg border border-[#E0DBD5] bg-white text-[#1A1614] focus:ring-2 focus:ring-[#5C8A6B]/20 focus:border-[#5C8A6B] outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#7A716A] mb-1">Style</label>
                  <select id="baby-new-select-style" value={babyGender} onChange={e => setBabyGender(e.target.value as any)} className="w-full text-sm px-3 py-2 rounded-lg border border-[#E0DBD5] bg-white text-[#1A1614] focus:ring-2 focus:ring-[#5C8A6B]/20 focus:border-[#5C8A6B] outline-none">
                    <option value="surprise">Neutral</option>
                    <option value="boy">Blue</option>
                    <option value="girl">Rose</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button id="baby-new-btn-cancel" type="button" onClick={() => { setShowAddForm(false); resetForm(); }} className="flex-1 py-2 text-xs font-medium text-[#7A716A] bg-white border border-[#E0DBD5] rounded-lg hover:bg-[#F5F2EE] cursor-pointer transition-all">Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} id="baby-new-btn-submit" type="submit" className="flex-1 py-2 text-xs font-semibold text-white bg-[#5C8A6B] rounded-lg hover:bg-[#4E7A5C] cursor-pointer transition-all flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Add Profile
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── EDIT FORM ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEditForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onSubmit={handleSubmitEdit}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 bg-[#F0EBF8] rounded-xl border border-[#C9B8E8] space-y-3">
              <p className="text-xs font-semibold text-[#7C5CBF] uppercase tracking-wide flex items-center gap-2">
                <Pencil className="w-3.5 h-3.5" /> Edit Baby Profile
              </p>
              <div>
                <label className="block text-[11px] font-medium text-[#7A716A] mb-1">Name</label>
                <input id="baby-edit-input-name" type="text" required placeholder="e.g. Leo" value={babyName} onChange={e => setBabyName(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-[#E0DBD5] bg-white text-[#1A1614] focus:ring-2 focus:ring-[#5C8A6B]/20 focus:border-[#5C8A6B] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#7A716A] mb-1">Age (months)</label>
                  <input id="baby-edit-input-age" type="number" min="0" max="36" required value={babyAge} onChange={e => setBabyAge(parseInt(e.target.value) || 1)} className="w-full text-sm px-3 py-2 rounded-lg border border-[#E0DBD5] bg-white text-[#1A1614] focus:ring-2 focus:ring-[#5C8A6B]/20 focus:border-[#5C8A6B] outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#7A716A] mb-1">Style</label>
                  <select id="baby-edit-select-style" value={babyGender} onChange={e => setBabyGender(e.target.value as any)} className="w-full text-sm px-3 py-2 rounded-lg border border-[#E0DBD5] bg-white text-[#1A1614] focus:ring-2 focus:ring-[#5C8A6B]/20 focus:border-[#5C8A6B] outline-none">
                    <option value="surprise">Neutral</option>
                    <option value="boy">Blue</option>
                    <option value="girl">Rose</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button id="baby-edit-btn-cancel" type="button" onClick={() => { setShowEditForm(null); resetForm(); }} className="flex-1 py-2 text-xs font-medium text-[#7A716A] bg-white border border-[#E0DBD5] rounded-lg hover:bg-[#F5F2EE] cursor-pointer transition-all">Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} id="baby-edit-btn-submit" type="submit" className="flex-1 py-2 text-xs font-semibold text-white bg-[#7C5CBF] rounded-lg hover:bg-[#6B4EC4] cursor-pointer transition-all flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Update Profile
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── BABY CARDS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {babies.map((baby, idx) => {
          const isSelected = baby.id === selectedBabyId;
          const colors = genderColors[baby.gender];

          return (
            <motion.div
              key={baby.id}
              id={`baby-card-${baby.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer group ${isSelected ? `${colors.activeBg} ${colors.activeBorder}` : `bg-white border-[#EAE6E0] hover:border-[#D5CFC8]`}`}
            >
              {isSelected && (
                <motion.div
                  layoutId="selectedDot"
                  className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${colors.dot}`}
                />
              )}
              
              {/* Click to select baby */}
              <div onClick={() => onSelectBaby(baby.id)} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isSelected ? `${colors.activeBg} ${colors.activeBorder}` : 'bg-[#F7F5F2] border-[#E8E4DE]'}`}>
                  <Baby className={`w-5 h-5 ${isSelected ? colors.text : 'text-[#7A716A]'}`} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-sm font-semibold text-[#1A1614] truncate">{baby.name}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${colors.badge}`}>{baby.ageMonths}mo</span>
                  </div>
                  <p className="text-xs text-[#A8A09A] mt-0.5">
                    {baby.gender === 'boy' ? 'Blue theme' : baby.gender === 'girl' ? 'Rose theme' : 'Neutral theme'}
                  </p>
                </div>
              </div>

              {/* Edit/Delete actions - visible on hover */}
              <div className="absolute bottom-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  id={`baby-edit-${baby.id}`}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleEditOpen(baby); }}
                  className="w-7 h-7 rounded-lg bg-white border border-[#E0DBD5] hover:bg-[#F0EBF8] hover:border-[#C9B8E8] flex items-center justify-center transition-all cursor-pointer text-[#7C5CBF]"
                  title="Edit baby"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`baby-delete-${baby.id}`}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(baby.id, baby.name); }}
                  className="w-7 h-7 rounded-lg bg-white border border-[#E0DBD5] hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-all cursor-pointer text-red-500"
                  title="Delete baby"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}