const names = { living_room: '客廳', dining_room: '餐廳', master_bedroom: '主臥室', bedroom: '臥室', bedroom1: '臥室一', bedroom2: '臥室二', bedroom3: '臥室三', kitchen: '廚房', bathroom: '浴室', bathroom1: '衛浴一', bathroom2: '衛浴二', bathroom3: '衛浴三' };
const subjects = { living_room: 'living room with sofa, coffee table, armchairs, television and rug', dining_room: 'dining room with dining table and chairs', master_bedroom: 'master bedroom with bed and bedside tables', bedroom: 'bedroom with bed and bedside tables', kitchen: 'kitchen with cabinets and appliances', bathroom: 'bathroom with basin, toilet and shower' };
import { assertSingleProposalSpaceLimit, isBalconySpace, MIN_GENERATED_REFERENCES } from './singleProposalPolicy.js';

export function completionRooms(project) {
  const media = project?.proposal_media?.space_photos || {};
  return Object.keys(media).filter(room => room !== 'floor_plan' && !isBalconySpace(room)).map(room => {
    const seen = new Set();
    const revisions = (project.reference_revisions || []).filter(r => {
      if (r.project_id !== (project.project_id || project.id) || (r.completion_room || r.source_photo_room || r.space) !== room ||
          r.task_status !== 'completed' || !r.source_task_id || !r.image_url || r.fallback_reason || ['archived', 'failed', 'rejected'].includes(r.status)) return false;
      const identity = r.output_sha256 || r.image_url;
      if (seen.has(identity)) return false;
      seen.add(identity); return true;
    });
    return { room, label: names[room] || room, sources: [...new Set((media[room] || []).filter(Boolean))], revisions, missing: Math.max(0, MIN_GENERATED_REFERENCES - revisions.length) };
  });
}

export async function completeProposalImages({ getProject, generate, save, onProgress = () => {} }) {
  assertSingleProposalSpaceLimit(getProject());
  const rooms = completionRooms(getProject());
  if (!rooms.length) throw new Error('請先在需求表登錄提案空間；無照片的空間也可登錄。');
  let saved = 0;
  for (const initial of rooms) {
    for (;;) {
      const project = getProject();
      const room = completionRooms(project).find(r => r.room === initial.room);
      if (!room || !room.missing) break;
      const occupied = new Set(room.revisions.map(r => r.completion_slot).filter(Number.isInteger));
      const slot = [0, 1, 2, 3].find(i => !occupied.has(i)) ?? room.revisions.length;
      const source = room.sources[slot % room.sources.length] || null;
      const rejected = (project.reference_revisions || []).filter(r => r.completion_room === room.room && ['rejected', 'failed', 'archived'].includes(r.status)).map(r => r.source_task_id);
      const fingerprint = JSON.stringify(['photo-reference-v2', project.project_id || project.id, room.room, room.sources, project.primary_style, project.special_requirements, slot, rejected]);
      let hash = 2166136261;
      for (const c of fingerprint) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
      onProgress(`${room.label}：生成第 ${slot + 1}/4 張`);
      const subjectKey = room.room.replace(/\d+$/, '');
      const prompt = `Photorealistic interior photograph, single continuous room, eye-level wide angle perspective. Fully furnished ${subjects[subjectKey] || room.label}. Interior design reference ${slot + 1} of 4. ${project.primary_style || project.preferred_style || 'modern'} style. ${project.special_requirements || ''}. Coherent materials and lighting. Design variation: ${['balanced layout', 'warm layered lighting', 'material and furniture detail', 'alternative furniture arrangement'][slot]}. ${source ? 'Derive from the source photograph; preserve walls and openings.' : 'Concept only, no site photograph; hypothetical geometry.'} No people, no text.`;
      const generated = await generate({ project, prompt, negativePrompt: `collage, moodboard, objects on white background, illustration, cartoon, line drawing, sketch, floor plan, empty room, duplicate furniture, distorted architecture, text, watermark${room.room === 'living_room' ? ', bed, bedroom, bedding' : ''}`, outputType: 'perspective_draft', purpose: 'proposal_space_completion', provider: 'comfyui', compactPreview: true,
        idempotencyKey: `proposal-fill-${hash}`, seed: hash, sourceMediaUrls: source ? [source] : [],
        operation: { creative_mode: '保留格局，重新設計家具與材質', space: room.label, completion_room: room.room, completion_slot: slot, provenance: source ? 'source_photo_derived' : 'no_photo_concept', geometry_verified: false } });
      if (!generated.task?.output_sha256 || room.revisions.some(r => r.output_sha256 === generated.task.output_sha256 || r.image_url === generated.url)) throw new Error('補圖結果重複或缺少雜湊，未將此圖計入或扣點。');
      await save({ image_url: generated.url, original_image_url: generated.source_url, source_image_url: source,
        ...(source ? { source_photo_room: room.room } : {}), space: room.label, completion_room: room.room, completion_slot: slot,
        provenance: source ? 'source_photo_derived' : 'no_photo_concept', geometry_verified: false,
        source_task_id: generated.task.ai_task_id, task_status: generated.task.status, output_sha256: generated.task.output_sha256,
        workflow_version: generated.task.workflow_version, seed: generated.task.seed, prompt,
        generation_source: generated.generation_source, authoritative: generated.authoritative, image_role: 'ai_revision',
      }, `proposal-fill-result-${generated.task.ai_task_id}`);
      saved++;
      if (completionRooms(getProject()).find(r => r.room === room.room)?.missing >= room.missing) throw new Error('補圖尚未保存，停止後續生成。');
    }
  }
  return { saved, rooms: completionRooms(getProject()) };
}
